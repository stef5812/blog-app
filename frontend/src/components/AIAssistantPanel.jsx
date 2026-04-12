import { useState } from "react";
import { aiRewrite, aiGenerateTitles } from "../lib/api";

export default function AIAssistantPanel({
  selectedText,
  fullText,
  onReplace,
  onInsertBelow,
}) {
  const [instruction, setInstruction] = useState(
    "Improve clarity, flow, and grammar while preserving meaning."
  );
  const [result, setResult] = useState("");
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleRewrite() {
    setLoading(true);
    setErr("");
    setResult("");

    try {
      const sourceText = selectedText?.trim();

      if (!sourceText) {
        throw new Error("Please select some text in the editor first.");
      }

      const output = await aiRewrite({
        text: sourceText,
        instruction,
      });

      setResult(output);
    } catch (error) {
      setErr(error.message || "AI rewrite failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateTitles() {
    setLoading(true);
    setErr("");
    setTitles([]);

    try {
      const content = fullText?.trim();

      if (!content) {
        throw new Error("Write some content first.");
      }

      const generated = await aiGenerateTitles(content);
      setTitles(Array.isArray(generated) ? generated : []);
    } catch (error) {
      setErr(error.message || "AI title generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold">AI Assistant</h3>
      <p className="mt-1 text-sm text-zinc-600">
        Rewrite selected text without overwriting the editor automatically.
      </p>

      <label className="mt-4 block text-sm font-medium text-zinc-700">
        Instruction
      </label>
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        className="mt-2 min-h-24 w-full rounded-xl border border-zinc-300 p-3 text-sm outline-none"
      />

      {selectedText ? (
        <div className="mt-3">
          <div className="text-xs font-medium text-zinc-600">
            Selected text
          </div>
          <div className="mt-1 max-h-24 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm whitespace-pre-wrap text-zinc-700">
            {selectedText}
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Select some text in the editor first.
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleRewrite}
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Working..." : "Improve paragraph"}
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleGenerateTitles}
          disabled={loading}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 disabled:opacity-60"
        >
          {loading ? "Working..." : "Generate titles"}
        </button>
      </div>

      {err ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4">
          <div className="text-sm font-medium text-zinc-700">
            Improved text
          </div>

          <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm whitespace-pre-wrap">
            {result}
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onReplace(result)}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
            >
              Replace selection
            </button>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onInsertBelow(result)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800"
            >
              Insert below
            </button>
          </div>
        </div>
      ) : null}

      {titles.length > 0 ? (
        <div className="mt-4">
          <div className="text-sm font-medium text-zinc-700">
            Suggested titles
          </div>

          <div className="mt-2 space-y-2">
            {titles.map((title, index) => (
              <div
                key={`${title}-${index}`}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800"
              >
                {title}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}