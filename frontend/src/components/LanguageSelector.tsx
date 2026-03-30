import { state } from "../state";
import { languages } from "../utils/languages";

export default function LanguageSelector() {
  return (
    <div>
      <label>Send:</label>
      <select value={state.sendLanguage} onChange={e => state.sendLanguage = e.target.value}>
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>

      <label>Receive:</label>
      <select value={state.receiveLanguage} onChange={e => state.receiveLanguage = e.target.value}>
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}
