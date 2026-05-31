import { useState } from 'react';
import { PixelCheckbox } from '../inputs';

export function Default() {
  const [checked, setChecked] = useState(false);
  return (
    <PixelCheckbox
      label="Accept terms"
      checked={checked}
      onChange={setChecked}
    />
  );
}

export function Checked() {
  const [checked, setChecked] = useState(true);
  return (
    <PixelCheckbox
      label="Subscribe to newsletter"
      checked={checked}
      onChange={setChecked}
    />
  );
}

export function Tones() {
  const [values, setValues] = useState<Record<string, boolean>>({
    neutral: true,
    green: true,
    cyan: true,
    gold: true,
    red: true,
    purple: true,
    pink: true,
  });
  return (
    <div className="space-y-2">
      <PixelCheckbox
        label="Neutral"
        tone="neutral"
        checked={values.neutral}
        onChange={(v) => setValues((s) => ({ ...s, neutral: v }))}
      />
      <PixelCheckbox
        label="Green"
        tone="green"
        checked={values.green}
        onChange={(v) => setValues((s) => ({ ...s, green: v }))}
      />
      <PixelCheckbox
        label="Cyan"
        tone="cyan"
        checked={values.cyan}
        onChange={(v) => setValues((s) => ({ ...s, cyan: v }))}
      />
      <PixelCheckbox
        label="Gold"
        tone="gold"
        checked={values.gold}
        onChange={(v) => setValues((s) => ({ ...s, gold: v }))}
      />
      <PixelCheckbox
        label="Red"
        tone="red"
        checked={values.red}
        onChange={(v) => setValues((s) => ({ ...s, red: v }))}
      />
      <PixelCheckbox
        label="Purple"
        tone="purple"
        checked={values.purple}
        onChange={(v) => setValues((s) => ({ ...s, purple: v }))}
      />
      <PixelCheckbox
        label="Pink"
        tone="pink"
        checked={values.pink}
        onChange={(v) => setValues((s) => ({ ...s, pink: v }))}
      />
    </div>
  );
}

export function Surfaces() {
  const [pixel, setPixel] = useState(true);
  const [linear, setLinear] = useState(true);
  return (
    <div className="space-y-2">
      <PixelCheckbox
        label="Pixel surface"
        surface="pixel"
        checked={pixel}
        onChange={setPixel}
      />
      <PixelCheckbox
        label="Linear surface"
        surface="linear"
        checked={linear}
        onChange={setLinear}
      />
    </div>
  );
}

export function Disabled() {
  return (
    <div className="space-y-2">
      <PixelCheckbox
        label="Disabled unchecked"
        disabled
        checked={false}
        onChange={() => {}}
      />
      <PixelCheckbox
        label="Disabled checked"
        disabled
        checked={true}
        onChange={() => {}}
      />
    </div>
  );
}

export function Required() {
  const [checked, setChecked] = useState(false);
  return (
    <PixelCheckbox
      label="I agree to the terms"
      required
      checked={checked}
      onChange={setChecked}
    />
  );
}

export function WithFormName() {
  const [checked, setChecked] = useState(true);
  return (
    <form>
      <PixelCheckbox
        label="Remember me"
        name="remember"
        value="yes"
        checked={checked}
        onChange={setChecked}
      />
    </form>
  );
}

export function Group() {
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    push: true,
  });
  return (
    <div className="space-y-2">
      <PixelCheckbox
        label="Email notifications"
        checked={prefs.email}
        onChange={(v) => setPrefs((s) => ({ ...s, email: v }))}
      />
      <PixelCheckbox
        label="SMS notifications"
        checked={prefs.sms}
        onChange={(v) => setPrefs((s) => ({ ...s, sms: v }))}
      />
      <PixelCheckbox
        label="Push notifications"
        checked={prefs.push}
        onChange={(v) => setPrefs((s) => ({ ...s, push: v }))}
      />
    </div>
  );
}
