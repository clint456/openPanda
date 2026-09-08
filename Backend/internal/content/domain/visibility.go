package domain

// CanRead is the single detail-read policy. Authentication is verified by transport.
func CanRead(published, public, authenticated bool) bool {
	return authenticated || (published && public)
}
