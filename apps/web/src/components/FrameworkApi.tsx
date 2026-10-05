'use client';

import { Fragment, type ReactNode } from 'react';
import { FrameworkCode, type Framework } from './FrameworkCode';

/** A prop (React, Vue) or an input (Angular). */
export interface ApiProp {
  name: string;
  /** The type as a reader writes it. */
  type: string;
  /** The value it takes when unset, as source. */
  default?: string;
  required?: boolean;
  /** Its two-way binding: `v-model:open`, `[(open)]`. */
  binding?: string;
  /** Angular: what the input's transform accepts, where wider than `type`. */
  accepts?: string;
  /** Plain text with markdown code spans. */
  description?: string;
  deprecated?: string;
}

/** An event (Vue) or an output (Angular). */
export interface ApiEvent {
  name: string;
  /** The payload, as source; none when absent. */
  payload?: string;
  description?: string;
  deprecated?: string;
}

/** A slot (Vue). */
export interface ApiSlot {
  name: string;
  /** The props the slot passes, as source. */
  props?: string;
  description?: string;
}

/** A component, or one of its parts. */
export interface ApiComponent {
  name: string;
  /** Angular: the selector. */
  selector?: string;
  props?: ApiProp[];
  events?: ApiEvent[];
  slots?: ApiSlot[];
  /** What it also takes (native attributes), where `ref` points, form-control support. */
  notes?: string[];
}

/** A component's API in one framework: the import, then the component and its parts. */
export interface ApiReference {
  import: string;
  components: ApiComponent[];
}

/** A component's API in each framework whose kit has it — React always. */
export interface FrameworkApiReferences {
  react: ApiReference;
  vue?: ApiReference;
  angular?: ApiReference;
}

export interface FrameworkApiProps extends FrameworkApiReferences {
  /** Label of the tab list, for screen readers. */
  label: string;
  /**
   * The level of each component's heading when the reference lists parts:
   * one below the heading the reference sits under (4 under a section's h3,
   * 3 under a page's h2).
   */
  headingLevel?: 3 | 4;
}

/** What each framework calls the members of a component, and their absence. */
const TERMS: Record<Framework, { prop: string; props: string; event: string; events: string; none: string }> = {
  react: { prop: 'Prop', props: 'props', event: 'Event', events: 'events', none: 'No props of its own.' },
  vue: { prop: 'Prop', props: 'props', event: 'Event', events: 'events', none: 'No props, events or slots.' },
  angular: { prop: 'Input', props: 'inputs', event: 'Output', events: 'outputs', none: 'No inputs or outputs.' },
};

/** Prose with markdown code spans, as text and `<code>`. */
function Inline({ text }: { text: string }) {
  const parts = text.split('`');
  // An odd count of backticks leaves the last one unpaired: keep it as text.
  if (parts.length % 2 === 0) parts.splice(-2, 2, `${parts[parts.length - 2]}\`${parts[parts.length - 1]}`);
  return (
    <>
      {parts.map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>))}
    </>
  );
}

function Muted({ children }: { children: ReactNode }) {
  return <span className="docs-muted">{children}</span>;
}

function Description({ text, deprecated }: { text?: string; deprecated?: string }) {
  if (!text && !deprecated) return <Muted>—</Muted>;
  return (
    <>
      {deprecated && (
        <>
          <strong>Deprecated.</strong> <Inline text={deprecated} />
          {text && ' '}
        </>
      )}
      {text && <Inline text={text} />}
    </>
  );
}

function PropsTable({ component, framework }: { component: ApiComponent; framework: Framework }) {
  const terms = TERMS[framework];
  return (
    <table className="docs-props" aria-label={`${component.name} ${terms.props}`}>
      <thead>
        <tr>
          <th scope="col">{terms.prop}</th>
          <th scope="col">Type</th>
          <th scope="col">Default</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        {component.props!.map((prop) => (
          <tr key={prop.name}>
            <td>
              <code>{prop.name}</code>
              {prop.required && (
                <>
                  <span className="docs-required" aria-hidden="true">*</span>
                  <span className="sr-only"> (required)</span>
                </>
              )}
              {prop.binding && (
                <>
                  <br />
                  <Muted>
                    <code>{prop.binding}</code>
                  </Muted>
                </>
              )}
            </td>
            <td>
              <code>{prop.type}</code>
              {prop.accepts && (
                <>
                  <br />
                  <Muted>
                    accepts <code>{prop.accepts}</code>
                  </Muted>
                </>
              )}
            </td>
            <td>{prop.default ? <code>{prop.default}</code> : <Muted>—</Muted>}</td>
            <td>
              <Description text={prop.description} deprecated={prop.deprecated} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EventsTable({ component, framework }: { component: ApiComponent; framework: Framework }) {
  const terms = TERMS[framework];
  return (
    <table className="docs-events" aria-label={`${component.name} ${terms.events}`}>
      <thead>
        <tr>
          <th scope="col">{terms.event}</th>
          <th scope="col">Payload</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        {component.events!.map((event) => (
          <tr key={event.name}>
            <td>
              <code>{event.name}</code>
            </td>
            <td>{event.payload ? <code>{event.payload}</code> : <Muted>—</Muted>}</td>
            <td>
              <Description text={event.description} deprecated={event.deprecated} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SlotsTable({ component }: { component: ApiComponent }) {
  return (
    <table className="docs-slots" aria-label={`${component.name} slots`}>
      <thead>
        <tr>
          <th scope="col">Slot</th>
          <th scope="col">Slot props</th>
          <th scope="col">Description</th>
        </tr>
      </thead>
      <tbody>
        {component.slots!.map((slot) => (
          <tr key={slot.name}>
            <td>
              <code>{slot.name}</code>
            </td>
            <td>{slot.props ? <code>{slot.props}</code> : <Muted>—</Muted>}</td>
            <td>
              <Description text={slot.description} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ComponentApiView({
  component,
  framework,
  Title,
}: {
  component: ApiComponent;
  framework: Framework;
  /** The heading that names the component, when the reference lists parts. */
  Title?: 'h3' | 'h4';
}) {
  const members = (component.props?.length ?? 0) + (component.events?.length ?? 0) + (component.slots?.length ?? 0);
  return (
    <div className="docs-api-component">
      {Title && <Title>{component.name}</Title>}
      {component.selector && (
        <p>
          Selector: <code>{component.selector}</code>
        </p>
      )}
      {members === 0 && <p className="docs-empty">{TERMS[framework].none}</p>}
      {component.props?.length ? <PropsTable component={component} framework={framework} /> : null}
      {component.events?.length ? <EventsTable component={component} framework={framework} /> : null}
      {component.slots?.length ? <SlotsTable component={component} /> : null}
      {component.notes?.map((note) => (
        <p key={note} className="docs-api-note">
          <Inline text={note} />
        </p>
      ))}
    </div>
  );
}

/**
 * A component's API — props, events, slots, bindings — in React, Vue and
 * Angular, under the same tabs as the code (`FrameworkCode`): they follow the
 * reader's framework, and the server renders React's. Each tab starts with
 * the import, then the component and its parts.
 */
export function FrameworkApi({ react, vue, angular, label, headingLevel = 4 }: FrameworkApiProps) {
  const references: Record<Framework, ApiReference | undefined> = { react, vue, angular };
  const Title = headingLevel === 3 ? 'h3' : 'h4';
  return (
    <FrameworkCode variant="docs" label={label} react={react.import} vue={vue?.import} angular={angular?.import}>
      {(code, framework) => {
        const { components } = references[framework]!;
        return (
          <>
            <pre className="docs-code">
              <code>{code}</code>
            </pre>
            {components.map((component) => (
              <ComponentApiView
                key={component.name}
                component={component}
                framework={framework}
                Title={components.length > 1 ? Title : undefined}
              />
            ))}
          </>
        );
      }}
    </FrameworkCode>
  );
}
