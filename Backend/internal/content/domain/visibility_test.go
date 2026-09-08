package domain

import "testing"

func TestCanRead(t *testing.T) {
	for _, published := range []bool{false, true} {
		for _, public := range []bool{false, true} {
			for _, authenticated := range []bool{false, true} {
				want := authenticated || (published && public)
				if got := CanRead(published, public, authenticated); got != want {
					t.Errorf("CanRead(%v,%v,%v)=%v, want %v", published, public, authenticated, got, want)
				}
			}
		}
	}
}
