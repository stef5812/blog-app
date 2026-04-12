// frontend/BlogEditor

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextEditor({
  value,
  onChange,
  onSelectionChange,
  editorRef,
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;

      const text = editor.state.doc.textBetween(from, to, "\n");

      onSelectionChange?.(text);
    },
  });

  // expose editor to parent
  useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  return <EditorContent editor={editor} />;
}