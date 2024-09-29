package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/samuelemusiani/dumbo/db"
)

const DB_PATH = "./db.sqlite"

func main() {

	err := db.Connect(DB_PATH)
	if err != nil {
		slog.With("err", err).Error("Can't connect to db")
		os.Exit(1)
	}

	http.HandleFunc("/api/collect", collectHandler)

	slog.Info("Listening on port 8080")
	slog.With("err", http.ListenAndServe(":8080", nil)).Error("Can't listen")
	os.Exit(1)
}
