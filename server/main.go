package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/samuelemusiani/dumbo/config"
	"github.com/samuelemusiani/dumbo/db"
)

func main() {
	err := config.ParseConfig("config.toml")
	if err != nil {
		slog.With("err", err).Error("Can't parse config")
		os.Exit(1)
	}

	conf := config.GetConfig()

	err = db.Connect(conf.Database.Path)
	if err != nil {
		slog.With("err", err).Error("Can't connect to db")
		os.Exit(1)
	}

	// http.HandleFunc("/assets/{file}", uiHandler)
	http.HandleFunc("/api/collect", collectHandler)
	http.HandleFunc("/api/load", loadHandler)
	http.HandleFunc("/api/hosts", hostsHandler)
	http.HandleFunc("/api/hosts/{id}", singleHostHandler)
	//http.HandleFunc("/", rootHandler)

	slog.With("addr", conf.Server.Listen).Info("Listening")
	err = http.ListenAndServe(conf.Server.Listen, nil)
	if err != nil {
		slog.With("err").Error("Can't listen")
		os.Exit(1)
	}
}
