import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import PrismImport from "prismjs";
import "prismjs/components/prism-python";

// Vite CJS interop — ensure we get the real Prism API object.
const Prism =
  (PrismImport as unknown as { default?: typeof PrismImport }).default ??
  PrismImport;

const INDENT = "    "; // 4 spaces — Python style

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

function escapeHtml(code: string): string {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function leadingSpaces(line: string): string {
  const match = line.match(/^ */);
  return match ? match[0] : "";
}

function shouldIncreaseIndent(line: string): boolean {
  return /:\s*(#.*)?$/.test(line.trimEnd());
}

function applyTab(
  code: string,
  start: number,
  end: number,
  shift: boolean,
): { code: string; selectionStart: number; selectionEnd: number } {
  if (start !== end) {
    const lineStart = code.lastIndexOf("\n", start - 1) + 1;
    const lineEnd =
      end > 0 && code[end - 1] === "\n"
        ? end - 1
        : (() => {
            const n = code.indexOf("\n", end);
            return n === -1 ? code.length : n;
          })();
    const block = code.slice(lineStart, lineEnd);
    const lines = block.split("\n");
    const next = lines
      .map((line) => {
        if (!shift) return INDENT + line;
        if (line.startsWith(INDENT)) return line.slice(INDENT.length);
        if (line.startsWith("\t")) return line.slice(1);
        const spaces = leadingSpaces(line);
        return line.slice(Math.min(spaces.length, INDENT.length));
      })
      .join("\n");
    return {
      code: code.slice(0, lineStart) + next + code.slice(lineEnd),
      selectionStart: lineStart,
      selectionEnd: lineStart + next.length,
    };
  }

  if (!shift) {
    return {
      code: code.slice(0, start) + INDENT + code.slice(end),
      selectionStart: start + INDENT.length,
      selectionEnd: start + INDENT.length,
    };
  }

  const lineStart = code.lastIndexOf("\n", start - 1) + 1;
  const before = code.slice(lineStart, start);
  const spaces = leadingSpaces(before);
  const remove = Math.min(spaces.length, INDENT.length);
  if (remove === 0) {
    return { code, selectionStart: start, selectionEnd: end };
  }
  return {
    code: code.slice(0, start - remove) + code.slice(start),
    selectionStart: start - remove,
    selectionEnd: start - remove,
  };
}

function applyEnter(
  code: string,
  start: number,
  end: number,
): { code: string; selectionStart: number; selectionEnd: number } {
  const lineStart = code.lastIndexOf("\n", start - 1) + 1;
  const currentLine = code.slice(lineStart, start);
  let indent = leadingSpaces(currentLine);
  if (shouldIncreaseIndent(currentLine)) {
    indent += INDENT;
  }
  const insert = "\n" + indent;
  return {
    code: code.slice(0, start) + insert + code.slice(end),
    selectionStart: start + insert.length,
    selectionEnd: start + insert.length,
  };
}

function highlightPython(code: string): string {
  if (!code) return "";
  try {
    const lang = Prism.languages.python;
    if (!lang || typeof Prism.highlight !== "function") {
      return escapeHtml(code);
    }
    const html = Prism.highlight(code, lang, "python");
    return typeof html === "string"
      ? html.replace(/\n$/, "\n\n")
      : escapeHtml(code);
  } catch {
    return escapeHtml(code);
  }
}

export function CodeEditor({
  value,
  onChange,
  onSubmit,
  placeholder = "# Type your solution here…",
}: CodeEditorProps) {
  const [internal, setInternal] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(
    null,
  );

  useEffect(() => {
    setInternal(value);
  }, [value]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!pendingSelection.current || !textareaRef.current) return;
    const { start, end } = pendingSelection.current;
    pendingSelection.current = null;
    textareaRef.current.selectionStart = start;
    textareaRef.current.selectionEnd = end;
  }, [internal]);

  const update = useCallback(
    (next: string, selectionStart: number, selectionEnd: number) => {
      pendingSelection.current = { start: selectionStart, end: selectionEnd };
      setInternal(next);
      onChange(next);
    },
    [onChange],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onSubmit();
      return;
    }

    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (e.key === "Tab") {
      e.preventDefault();
      const result = applyTab(internal, start, end, e.shiftKey);
      update(result.code, result.selectionStart, result.selectionEnd);
      return;
    }

    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      const result = applyEnter(internal, start, end);
      update(result.code, result.selectionStart, result.selectionEnd);
    }
  };

  return (
    <div className="code-editor">
      <pre
        className="code-editor__pre"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: highlightPython(internal) }}
      />
      <textarea
        ref={textareaRef}
        id="typed-away-code"
        className="code-editor__textarea"
        value={internal}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={placeholder}
        aria-label="Code input"
        onChange={(e) => {
          setInternal(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onScroll={(e) => {
          const pre = e.currentTarget
            .previousElementSibling as HTMLElement | null;
          if (pre) {
            pre.scrollTop = e.currentTarget.scrollTop;
            pre.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
      />
    </div>
  );
}
