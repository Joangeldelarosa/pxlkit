# Diseño — Suite de skills de Claude Code para pxlkit + sección web `/skills`

- **Fecha**: 2026-08-08
- **Estado**: propuesta, pendiente de aprobación
- **Autor**: diseño asistido, fundamentado en análisis del código real del monorepo
- **Alcance**: plugin de Claude Code `pxlkit` (8 skills en dos oleadas) + generador de referencias desde el SSOT + gate de coherencia nuevo + página `/skills` en `apps/web`

> Convención de este documento: todas las rutas van en `código en línea`, nunca como enlaces markdown. El gate 13 (`dead-links`) escanea `docs/**/*.md` y un enlace a un archivo aún inexistente lo haría fallar como *major*.

---

## 1. Objetivo y problema

Hoy, para que un agente escriba código correcto con `@pxlkit/ui-kit` tiene que leer el repo: 111 componentes, dos escalas de `tone` que no son intercambiables, un sistema `surface` pixel/linear, un `styles.css` que no es autónomo (requiere Tailwind v4), tres providers, y un formato de iconos propietario (`PxlKitData`: grid de strings + palette) que ningún modelo conoce de memoria. Sin esa información, un agente produce React genérico con clases Tailwind crudas que *parece* pxlkit y no lo es.

El objetivo es empaquetar ese conocimiento —**derivado automáticamente del SSOT del repo**— en un plugin instalable de Claude Code, de modo que cualquier desarrollador obtenga interfaces pixel-perfect sin leer la documentación, y que el conocimiento no se desincronice cuando el kit publique una versión nueva.

**Criterio de éxito**: un usuario sin contexto previo instala el plugin con un comando, y en su siguiente prompt obtiene una página con ≥25 componentes distintos del kit que compila, pasa axe-core sin violaciones serias, no contiene ni una clase Tailwind de paleta cruda, y se ve inequívocamente pixel-art en claro y oscuro.

---

## 2. Decisiones de arquitectura

| # | Decisión | Alternativas descartadas | Razón |
|---|---|---|---|
| D1 | Las `references/` de los skills se **generan** desde el SSOT (`registry.generated.ts`, `*.manifest.ts`, `tokens.ts`, `styles.css`, `core/types.ts`) mediante un paso nuevo del pipeline `docs:build` | Escribirlas a mano | Escritas a mano quedan obsoletas en el primer release. El kit va por 2.1.1 con cascada de release frecuente. |
| D2 | Un **gate de coherencia nuevo** (`36-skill-refs-fresh`) compara un `digestHash` de los inputs con el declarado en `references/VERSION` | Confiar en la disciplina del release | Sin gate, el paso 4 del runbook (`docs:build`) se puede olvidar y nadie lo nota hasta que un usuario recibe API inventada. |
| D3 | El plugin vive en `plugins/pxlkit/` en la raíz del monorepo, **no declarado como workspace** | `packages/claude-plugin/` (workspace) | Declararlo workspace dispara los gates 02, 08, 15 y 16 (README, description, `npm publish --dry-run`, mapa de workspaces) sin ningún beneficio: el plugin no se publica en npm. |
| D4 | El **monorepo es su propio marketplace** (`.claude-plugin/marketplace.json` en la raíz, `source: "./plugins/pxlkit"`) | Repo espejo `pxlkit-skills` sincronizado por CI | Medido: `.git` = 35 MB, 1384 archivos trackeados = 16 MB. Un clon de 35 MB es aceptable para una instalación única. El repo espejo añade un punto de fallo de CI sin resolver un problema real. Se documenta `--sparse` como opción para quien quiera clon mínimo. |
| D5 | Todo criterio de calidad es un **comando con exit code o un conteo mecánico**; ningún skill se autoevalúa | Checklists que el modelo evalúa "a ojo" | La autoevaluación es la causa nº1 de que un generador declare PASS sobre output roto. |
| D6 | El **digest orienta, el paquete instalado manda**: cada skill lee `node_modules/@pxlkit/ui-kit/package.json#version` del proyecto destino y, si difiere en minor/major del digest, prefiere los tipos de `node_modules` | Asumir que el usuario tiene la última | Los consumidores fijan `^2.0.0`; sugerirles props de 2.1.1 que no existen en su 2.0.3 produce errores de compilación. |
| D7 | Namespace de comandos: `/pxlkit:<verbo>` (plugin `pxlkit`, marketplace `pxlkit`) | `/pxl-<verbo>` como skills sueltos en `~/.claude/skills/` | El plugin da versionado, `claude plugin update`, pin por SHA y desinstalación limpia. Los skills sueltos no se registran en `installed_plugins.json` ni tienen namespace. |
| D8 | Cada skill comprueba si hay una versión más nueva del plugin y la sugiere, con caché de 24 h y degradación silenciosa si no hay red | No comprobar y esperar a que el usuario lo descubra | Un plugin cuyo conocimiento está anclado a una versión del kit envejece mal en silencio. La comprobación es barata y convierte un fallo invisible en un aviso accionable. |

**Verificado en esta máquina** (no de memoria): el CLI `claude plugin` expone `marketplace add`, `install`, `validate`, `eval`, `tag`, `details`, `update`. El remote real del repo es `https://github.com/Joangeldelarosa/pxlkit`.

---

## 3. La suite de comandos

### Oleada 1 — plugin v1.0 (5 entradas)

| Comando | Intención de usuario | Por qué es irreducible |
|---|---|---|
| `/pxlkit:start` | "Prepárame el proyecto y enséñame qué puedo hacer" | Onboarding + preflight de setup. Sin él, el primer `imagine` falla en un proyecto sin Tailwind v4 y la experiencia inicial se arruina. |
| `/pxlkit:imagine` | "Créame un frontend pixel-art avanzado" | El comando estrella. Generación desde cero o desde una receta de plantilla. |
| `/pxlkit:pixelate` | "Convierte este sitio existente a pxlkit" | Flujo estructuralmente distinto: mapeo componente-a-componente preservando estado, rutas, handlers y tests. Fusionarlo con `imagine` degrada ambos. |
| `/pxlkit:icon` | "Créame un icono en el formato de pxlkit" | Formato propietario `PxlKitData` con un validador de CI que hay que satisfacer exactamente. |
| `/pxlkit:audit` | "Revisa que mi UI pxlkit esté bien hecha" | El diferenciador. Es el loop de validación desacoplado, reutilizado como subrutina por `imagine` y `pixelate` — un solo lugar que mantener. |

### Oleada 2 — plugin v1.1 (3 entradas)

| Comando | Intención | Justificación |
|---|---|---|
| `/pxlkit:reskin` | "Adapta pxlkit a los colores de mi marca" | No es "10 líneas de CSS": hay que re-declarar `--color-retro-*` en `.dark`/`.light` por el comportamiento de `@property`, las sombras `--retro-shadow-*` están acopladas a green/gold, y cada par tono/fondo necesita verificación de contraste AA. Gate: contraste calculado programáticamente. |
| `/pxlkit:upgrade` | "Actualiza mi código a la versión nueva del kit" | Los manifests ya llevan `status: deprecated`, `deprecatedReplacement` y `deprecatedRemovedIn` (gate 17), y el CHANGELOG es riguroso por los gates 19/32. Hay datos de sobra para un codemod guiado. Es el dolor recurrente de todo design system y nadie más puede resolverlo con esta precisión. |
| `/pxlkit:component` | "Quiero contribuir un componente al kit" | Flujo de contributor: manifest + examples + test + story + anchor de showcase + sección de docs + `docs:build` + bullet en `## Unreleased`. Empaqueta un checklist derivado de los 35 gates para que la PR pase `audit:coherence` a la primera. `disable-model-invocation: true` (solo invocable por el usuario) para no secuestrar tareas ajenas. |

**Descartado**: `/pxlkit:template` (es un argumento de `imagine`: `--from dashboard`). Voxel 3D, el builder y Storybook quedan **explícitamente fuera de alcance** y así se declara en `/pxlkit:start` y en la web, para que ningún skill alucine soporte.

---

## 4. Arquitectura interna: referencias generadas desde el SSOT

### 4.1 Generador

Paso nuevo `generate-skill-refs` en `scripts/build-docs/`, registrado en `defaultPipelineSteps` de `orchestrate.ts` con `required: false` (mismo patrón que `generate-showcase`). Reusa `ctx.manifests` del paso `scan`: cero parsing duplicado.

Salidas en `plugins/pxlkit/references/`, todas con cabecera `<!-- GENERATED from @pxlkit/ui-kit vX.Y.Z — do not edit; run npm run docs:build -->` y nombre `*.generated.md` para respetar el contrato read-only del pipeline (que solo permite escribir salidas `.generated.*` y bloques marker).

| Archivo | Contenido | Fuente |
|---|---|---|
| `components/<categoria>.generated.md` (12) | Por componente: nombre, firma de props condensada, enums, gotchas, `related` | `registry.generated.ts` + manifests + el extractor de props que ya alimenta `props: 'auto'` |
| `tokens.generated.md` | Los dos mapas de tone con la advertencia de no mezclarlos, `sizeClass`, tabla `surfaceClasses` pixel/linear, variables `--retro-*` claro/oscuro, receta de re-skin | `common.tsx` + `tokens.ts` + parse de `:root`/`.dark` en `styles.css` |
| `recipes.generated.md` | Recetas canónicas de composición con snippet verbatim | bloques marcados de `apps/web/src/components/templates/*` |
| `setup.generated.md` | Setup del consumidor: Tailwind v4, `@source`, `styles.css`, providers, fuentes, dark mode, matriz Next App Router / Pages Router / Vite | `packages/ui-kit/package.json` + `apps/web/src/app/globals.css` como ejemplo real |
| `icon-spec.generated.md` | Formato `PxlKitData` completo, reglas de ambos validadores, ejemplo simple y animado verbatim, pasos de registro | `core/src/types.ts` + `validateIconData.ts` + `validate-icons.js` |
| `icon-shapes.generated.json` | Firma de ocupación (256 bits) + tags de los 226 iconos, por pack | ejecutar los `dist` de los 7 packs |
| `diversity-menu.generated.md` | Los 111 componentes por categoría, marcados `[core]`/`[distintivo]`/`[infrautilizado]` según su frecuencia real en las plantillas | registry + conteo de imports en `apps/web/src/components/templates/` |
| `VERSION.json` | `{uiKit, date, digestHash}` | `version-meta.json` + sha256 de los inputs |

`pixelate-map.md` es la **única referencia curada a mano** (el mapeo shadcn/MUI/antd → `Pixel*` no se puede derivar del repo), pero el gate 36 valida que cada componente destino que cita exista en el registry.

### 4.2 Anti-desincronización, tres mecanismos

1. **Cascada de release**: `docs:build` ya corre en el paso 4 del runbook, así que las referencias se regeneran en el mismo commit `chore(release)` que bumpea la versión.
2. **Gate `36-skill-refs-fresh`**: recalcula el `digestHash` y lo compara con `VERSION.json`; mismatch = *major* (falla la PR). Verifica además que todo componente citado en `pixelate-map.md` exista en el registry, y que `plugin.json`, la entrada del marketplace y `VERSION.json` declaren la misma versión.
3. **Check en tiempo de ejecución**: paso 0 de cada `SKILL.md` — leer la versión instalada en el proyecto destino y degradar al comportamiento de D6 si difiere.

### 4.3 Versionado del plugin

> **Corregido durante la implementación.** El diseño original acoplaba la versión del plugin a la del kit, y el gate 36 lo imponía comparando `plugin.json` contra `VERSION.json.uiKit`. Estaba mal, y lo demostró el propio trabajo: comprimir las descripciones de los skills fue un cambio real del plugin, valioso para el usuario, sin tocar el kit — y bajo el acoplamiento se habría publicado sin número de versión nuevo, es decir, sin señal de actualización. Justo el fallo que §4.4 existe para evitar.
>
> Ahora son **dos cadenas independientes**. La del plugin (`plugin.json` = entrada del marketplace = `VERSION.json.plugin`) es lo que el usuario instala y actualiza. La del kit (`VERSION.json.uiKit` = versión real del ui-kit) registra de qué versión se generó el digest, para que un skill pueda saber si su mapa sigue correspondiendo al territorio. El gate 36 verifica cada una por separado.
>
> Consecuencia práctica: el plugin arranca en **1.0.0**, que es lo honesto para un artefacto nuevo en su primera publicación. Que el kit vaya por 2.1.1 es información distinta, y se muestra como tal.


El repo **no tiene** el script `release:bump` que su propio runbook cita (`docs/runbooks/ship-a-release.md:64` menciona `pnpm run release:bump`, y el repo usa npm). Esto se resuelve dentro de este trabajo: se añade `scripts/release/bump-plugin.mjs`, invocado desde la cascada, que sincroniza `plugin.json`, la entrada de `marketplace.json` y `VERSION.json` con la versión del ui-kit. El gate 36 verifica la tripleta.

Política de tags: `claude plugin tag` crea `pxlkit--v<X.Y.Z>` junto al `v<X.Y.Z>` que crea el workflow de publish. Se documenta en el runbook para que nadie interprete la divergencia como un error.

### 4.4 Aviso de versión nueva

Un plugin cuyo conocimiento está anclado a una versión concreta del kit envejece en silencio: el usuario sigue recibiendo respuestas plausibles construidas sobre una API que ya cambió. Para que ese fallo sea visible, cada skill comprueba en su paso 0 si existe una versión más nueva y, si la hay, lo dice.

**Fuente de verdad**, en este orden y con degradación en cascada:

1. `https://pxlkit.xyz/skills/version.json` — servido por `apps/web` desde el mismo SoT que el resto del sitio (`pxlkit-version.ts` más la versión del plugin). Es la fuente autoritativa porque es la única que conoce la versión del **plugin**, que puede avanzar independientemente del kit.
2. El registro de npm (`https://registry.npmjs.org/@pxlkit/ui-kit/latest`) como respaldo si el sitio no responde. Solo informa de la versión del kit, que sirve como cota inferior.
3. Si ninguna responde, **no pasa nada**: el skill continúa sin mencionar el tema.

**Reglas de comportamiento**, que existen para que la comprobación no se convierta en una molestia ni en un riesgo:

- **Caché de 24 horas** en el directorio temporal del sistema. Una sesión larga con diez invocaciones hace como mucho una petición.
- **Tiempo límite de 2 segundos** y fallo silencioso. Sin red, con proxy, o con la web caída, el skill funciona igual: la comprobación nunca bloquea ni aborta el trabajo.
- **Se avisa al final, nunca al principio**: el aviso va después del resultado del trabajo, en una línea, con el comando exacto (`claude plugin update pxlkit`). No interrumpe, no pregunta, no espera respuesta.
- **Solo se avisa si la versión disponible es mayor** según comparación semver real, no comparación de cadenas (`2.10.0` es mayor que `2.9.0`).
- **Se declara en el `SKILL.md` y en la web** que el skill hace una petición de red para esto, y cómo desactivarla (variable de entorno `PXLKIT_SKIP_UPDATE_CHECK=1`). Un skill que llama a la red sin decirlo es un skill en el que no se puede confiar.

Además del aviso de plugin desactualizado, la misma comprobación cubre el caso inverso y más peligroso: si el proyecto del usuario tiene una versión del kit **más nueva** que el digest empaquetado, el skill lo advierte y aplica D6 (los tipos de `node_modules` mandan sobre el digest).

---

## 5. Loop de validación y quality gates

Común a `imagine`, `pixelate` y `audit`. Ciclo **generar → validar → arreglar → revalidar**, máximo 3 iteraciones por gate. Si un gate sigue en FAIL a la tercera, se reporta honestamente; **nunca se declara PASS lo que no pasó**.

| Gate | Método | PASS | Severidad |
|---|---|---|---|
| G1 tipos | `tsc --noEmit` del proyecto destino | exit 0 | blocker |
| G2 build | script de build del proyecto | exit 0 | blocker |
| G3 runtime | cargar cada ruta en navegador | 0 errores de consola, 0 assets 404 | blocker |
| G4 diversidad | `count-diversity.mjs` sobre los imports del código generado | umbrales de §5.1 | major |
| G5 pureza de tokens | `token-purity.mjs`: regex de paleta Tailwind cruda y hex inline en JSX | 0 coincidencias | major |
| G6 visual | screenshots a 390/768/1440 px, claro y oscuro | checklist §5.2 ≥8/10, sin overflow horizontal | major |
| G7 a11y | axe-core por ruta | 0 violaciones serious/critical | major |
| G8 setup | grep de `styles.css`, providers, fuentes, `@source` | todos presentes | blocker |
| P6 (pixelate) | tests **de comportamiento** preexistentes | mismo resultado que la baseline | blocker |
| I1–I3 (icon) | `check-icon.mjs` → `validate-icons.js` → conteo +1 | exit 0 | blocker |

**Dos correcciones deliberadas** respecto a la propuesta original de gates:

- **P6 separa tests de comportamiento de snapshots**. Exigir que *todos* los tests preexistentes pasen igual es infactible: cualquier snapshot o test visual falla por definición cuando el DOM cambia. Los snapshots se regeneran mostrando el diff y pidiendo consentimiento.
- **G3/G6/G7 no instalan nada en silencio**. Si no hay navegador disponible en el entorno, el gate se reporta como **SKIP explícito**, nunca como PASS, y se ofrece instalarlo. Descargar ~300 MB de navegadores sin pedir permiso es inaceptable.

### 5.1 Umbrales de diversidad

Se derivan del percentil real de las plantillas del repo, y son **suelos con excepción justificable**, no cuotas ciegas: meter un `PixelDatePicker` en una landing para cumplir cuota es anti-calidad, no pro-calidad.

- Landing completa: ≥25 componentes distintos, ≥8 de las 12 categorías, ≥3 marcados `[infrautilizado]`.
- Dashboard: ≥20 distintos; obligatorios `PixelDataTable`, ≥2 charts, y `PixelCommand` o `PixelDrawer`.
- Página simple: ≥12 distintos.

Reglas de composición: dos secciones adyacentes no comparten componente primario; ≥4 tonos distintos por página; en bento, jerarquía real (al menos una celda 2×2); todo hero lleva `media` o un efecto de movimiento.

### 5.2 Checklist anti-diseño-genérico

Evaluada **sobre los screenshots**, ítems binarios: esquinas escalonadas visibles (prueba de que `styles.css` cargó), sombras offset duras sin blur, display en `font-pixel` y body en mono/sans según surface, ≥4 tonos distinguibles, ≥1 elemento en movimiento, modo oscuro con fondos de la familia `#0A0A0F` y acentos neón (no un invert), ninguna card blanca plana ni gris Tailwind crudo, densidad (hero con eyebrow y meta, stats con sparklines), focus ring visible al tabular, jerarquía de bento no uniforme. PASS ≥8/10.

---

## 6. Especificación por skill

### 6.1 `/pxlkit:start`

Verifica el plugin, detecta el estado del proyecto y enseña la suite. **Clasifica el entorno en tres estados y nunca "arregla" una migración grande inline**:

- Tailwind v4 presente → OK, aplica el setup restante si falta.
- Tailwind v3 → **no migra en el momento**: explica que v3→v4 puede romper el CSS existente y ofrece un plan de migración separado con consentimiento explícito.
- Sin Tailwind, sin React, o React < 18.2 → aborta con explicación honesta. El `styles.css` del kit **no es autónomo** (`@import "tailwindcss"` + `@theme`): sin pipeline v4 no hay nada que hacer.

Detecta el gestor de paquetes: con pnpm el paquete vive symlinkeado bajo `.pnpm/` y la ruta relativa de `@source` no resuelve igual; con Yarn PnP no hay `node_modules`. El skill emite el `@source` correcto para cada caso.

Ramifica la receta de setup según el framework: Next App Router (providers en `layout.tsx`, `'use client'` en los wrappers), Next Pages Router (`_app`), o Vite/CRA (`main.tsx`, `'use client'` irrelevante). Incluye receta de modo oscuro sin FOUC — el kit no trae `ThemeProvider`, usa clase `.dark` manual.

### 6.2 `/pxlkit:imagine [descripción] [--from <plantilla>] [--surface pixel|linear]`

Fases: **0** contexto y versión instalada → **1** brief estructural (5–9 secciones del catálogo de recetas, máximo 3 preguntas en un solo turno) → **2** presupuesto de diversidad, tabla sección×componentes **antes** de escribir código → **3** generación (datos en `const` arriba, JSX solo mapea; providers en el root; secciones con `PixelContainer` canónico) → **4** loop de validación de §5 → **5** informe con la tabla de gates PASS/FAIL y componentes usados.

Reglas duras codificadas, extraídas de los gotchas reales: no mezclar `toneMap` (controles) con `tokens.tone` (superficies); `useToast` solo bajo `PxlKitToastProvider`; `PixelCard href` nunca con interactivos anidados; `interactive` sin `href` exige `onClick`; con `PixelForm.Field` no pasar `label`/`error` al input; en `PixelDataTable` la paginación solo aparece si pasas `pagination`; `appearance="solid"` de `PxlKitIcon` **no** respeta `currentColor` (el icono se renderiza como `<img>` con data URI) — hay que pasar `color`.

### 6.3 `/pxlkit:pixelate [ruta] [--scope page|component|app]`

**Solo opera sobre código local del workspace.** Aceptar una URL implicaría traer contenido no confiable que luego alimenta a un agente con permisos de escritura y Bash — es un vector de prompt injection. Si se necesita mirar una referencia visual externa, se hace por captura de pantalla tratada como *dato*, nunca como instrucción, y así se declara en el `SKILL.md`.

Flujo: inventario del proyecto → **tabla de mapeo mostrada antes de tocar nada** (único checkpoint) → migración incremental por commits lógicos preservando rutas, estado, handlers, data-fetching y `aria-*` → mapeo de paleta de marca a tonos por hue (con opción de re-skin para conservar la marca) → decisión de surface global o híbrida (marketing pixel / app linear vía provider por subárbol) → validación con G1–G8 + P6.

Regla anti-alucinación: lo que no tiene equivalente se **conserva y se envuelve en `PixelBox`**; jamás se inventa un componente inexistente. Los charts multi-serie se quedan con su librería original y se avisa: los charts del kit son de serie única.

### 6.4 `/pxlkit:icon [nombre] [descripción] [--pack ...] [--animated]`

**El modo por defecto es standalone** (usuario externo): genera un `PxlKitData` en `src/icons/` del proyecto del usuario, validado con `validateIconData()` de `@pxlkit/core`, con preview renderizada. El modo *contributor* (escribir en `packages/<pack>/src/icons/`, re-exportar, añadir al array `icons` del `IconPack`, correr `validate-icons.js`) se activa **solo si detecta que está dentro del monorepo**. La propuesta original tenía esto invertido.

El skill empaqueta `check-icon.mjs`, un superset estricto de ambos validadores: reglas de `validateIconData` (name kebab-case, `size` ∈ {8,16,24,32,48,64} forzado a 16 por convención, hex `#RGB|#RRGGBB|#RRGGBBAA`, `.` prohibido en palette) + reglas del gate de CI (16 filas × 16 chars por frame, todo char del grid presente en la palette) + comparación Jaccard contra `icon-shapes.generated.json`.

**Corrección sobre el umbral de duplicados**: un Jaccard ≥0.90 como FAIL duro bloquearía familias legítimas — las flechas direccionales y los chevrons superan ese valor por diseño, y de hecho el validador actual ya emite ~6 warnings de ese tipo. Regla adoptada: FAIL solo si el solapamiento alto **coincide además con ≥1 tag semántico compartido**; en el resto de casos, warning con confirmación.

**Licencia, correctamente atribuida**: un icono que el usuario crea en su propio proyecto **es suyo**. `LICENSE-ASSETS` cubre los packs existentes de pxlkit; solo si el usuario *contribuye* el icono al repo cae bajo `CONTRIBUTOR_LICENSE`. Lo que sí requiere atribución visible ("Icons by Pxlkit" + enlace) es **usar** los 226 iconos existentes, y eso se explica en el skill y en la web.

### 6.5 `/pxlkit:audit [ruta] [--fix] [--visual]`

Ejecuta G3–G7 más la checklist visual sobre una UI pxlkit existente y emite un informe `regla · archivo:línea · fix propuesto`, clasificado con el mismo vocabulario blocker/major/minor que los gates del repo. Con `--fix` aplica los auto-corregibles **tras mostrar el diff**, y lista aparte los que requieren decisión humana.

---

## 7. Seguridad

Cada `SKILL.md` declara `allowed-tools` con patrones estrechos (por ejemplo `Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/*:*)`). El preflight **propone** comandos de instalación en lugar de ejecutarlos. `--fix`, migraciones y regeneración de snapshots siempre pasan por diff y confirmación. `pixelate` no acepta URLs como fuente de código. Las descriptions se acotan a "cuando el proyecto usa o quiere usar `@pxlkit/*`" para no colisionar con skills genéricos de UI ya instalados.

---

## 8. Sección `/skills` en `apps/web`

Página estática con sidebar (patrón de `/docs`, que es el dominante del repo — no hay ningún segmento dinámico en `src/app`), dogfooding total del ui-kit.

**Archivos**: `apps/web/src/app/skills/layout.tsx` y `page.tsx` nuevos; entrada en `NAV_ITEMS` de `apps/web/src/components/Navbar.tsx`; enlace en `Footer.tsx`; entrada en `ROUTES` de `apps/web/src/app/sitemap.ts`.

**Secciones**: hero con terminal animada mostrando `/pxlkit:imagine` en acción · instalación en un `CodeBlock` con copiado y pestañas (marketplace / clon de desarrollo / requisitos) · la suite en un `PixelBento` con jerarquía · una subsección por skill (qué hace, argumentos en `PixelTable`, transcript real, errores frecuentes en `PixelAccordion`) · recorrido "de cero a pixel-perfect" en `PixelTimeline` · FAQ y licencias.

**SEO, tratado como requisito y no como adorno**: el público real de esta página incluye agentes. Contenido renderizado en servidor donde se pueda, `opengraph-image` propia, JSON-LD (`SoftwareApplication` + `HowTo` con el comando de instalación), y **`/skills/llms.txt`**: una versión en texto plano con instalación, comandos y spec resumida. Coste trivial, valor alto. Además, enlace de instalación en el README raíz y en el README de npm del ui-kit.

**Restricciones respetadas**: versión y conteos siempre desde `pxlkit-version.ts` y `pxlkit-counts.ts`, nunca hardcodeados (gates 06, 30, 33); no tocar `docs/sections/` ni `ui-kit/sections/`, que son generados; todos los imports deben resolver (gate 14); si se anuncian los skills en el `whats-new-strip` hay que añadir el bullet correspondiente en `### Added` del CHANGELOG (gates 31/34).

---

## 9. Instalación

```bash
claude plugin marketplace add Joangeldelarosa/pxlkit && claude plugin install pxlkit@pxlkit
```

Un solo copy-paste. Actualización con `claude plugin update pxlkit`. Para clon mínimo se documenta `claude plugin marketplace add Joangeldelarosa/pxlkit --sparse plugins/pxlkit`.

Recorrido completo: instalar → `/pxlkit:start` (setup del proyecto) → `/pxlkit:imagine ...` (primer resultado visible) → `/pxlkit:icon ...` (icono propio validado) → `/pxlkit:audit --fix --visual` (pixel-perfect verificado).

---

## 10. Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Las referencias se desincronizan del kit | alta | D1 + D2 + D6: generación desde SSOT, gate de frescura, y preferencia por `node_modules` en tiempo de ejecución |
| El plugin y el ui-kit divergen de versión | alta | `bump-plugin.mjs` en la cascada + verificación de la tripleta en el gate 36 |
| Un skill declara PASS sobre output roto | alta | D5: todos los gates son comandos con exit code; SKIP explícito cuando falta tooling |
| El gate 13 falla por enlaces a archivos futuros en los docs de planificación | media | Rutas en código en línea, nunca como enlaces markdown; correr `npm run audit` antes de commitear |
| El generador viola el contrato read-only del pipeline | media | Salidas nombradas `*.generated.*` + tests en `scripts/build-docs` (el repo ya corre `vitest --root scripts/build-docs`) |
| Prompt injection vía contenido externo | media | `pixelate` solo opera sobre código local; contenido externo solo como dato |
| La checklist de calidad nunca se ejecuta antes de publicar | media | Suite de evals con `claude plugin eval`: casos en Vite greenfield, Next App Router, pixelate sobre un fixture de shadcn, e icono deliberadamente duplicado |
| Los transcripts de la web envejecen | baja | Generados desde los casos de eval y cubiertos por el gate 36 |

---

## 11. Fuera de alcance

Motor voxel y 3D, el builder de iconos de la web, generación de Storybook, y soporte para frameworks sin React (Vue, Svelte, Astro sin React). Se declara explícitamente en `/pxlkit:start` y en la web para que ningún skill alucine soporte.
