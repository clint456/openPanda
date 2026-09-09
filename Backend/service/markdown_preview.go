package service

import "io"

type MarkdownPreview struct {
	Article TransferArticle `json:"article"`
	Content string          `json:"content"`
}

// PreviewMarkdown never writes files or database records.
func PreviewMarkdown(name string, r io.Reader) (MarkdownPreview, error) {
	data, err := io.ReadAll(io.LimitReader(r, (10<<20)+1))
	if err != nil {
		return MarkdownPreview{}, err
	}
	a, content, err := parseMarkdown(name, string(data))
	return MarkdownPreview{Article: a, Content: content}, err
}
