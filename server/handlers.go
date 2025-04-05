package main

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/samuelemusiani/dumbo/config"
	"github.com/samuelemusiani/dumbo/db"
	"github.com/samuelemusiani/dumbo/types"
)

const UI_DIR = "./dist"

func rootHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Allow", "OPTIONS GET")
		return
	} else if r.Method != http.MethodGet {
		http.Error(w, "Only GET is allowed", http.StatusMethodNotAllowed)
		return
	}

	b, err := os.ReadFile(path.Join(UI_DIR, "index.html"))
	if err != nil {
		slog.With("err", err).Error("Can't get index.html")
		http.Error(w, "Can't read index.html", http.StatusInternalServerError)
		return
	}

	w.Write(b)
}

func uiHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Allow", "OPTIONS GET")
		return
	} else if r.Method != http.MethodGet {
		http.Error(w, "Only GET is allowed", http.StatusMethodNotAllowed)
		return
	}

	file := strings.TrimPrefix(r.URL.Path, "/assets/")
	ext := path.Ext(file)

	var mime string

	switch ext {
	case ".js":
		mime = "text/javascript"
	case ".css":
		mime = "text/css"
	}

	path := path.Join(UI_DIR, "assets", file)
	b, err := os.ReadFile(path)
	if err != nil {
		slog.With("err", err, "file", file).Error("Can't get file")
		http.Error(w, "Can't read file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", mime)
	w.Write(b)
}

func collectHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Allow", "OPTIONS POST")
		return
	} else if r.Method != http.MethodPost {
		http.Error(w, "Only POST is allowed", http.StatusMethodNotAllowed)
		return
	}

	conf := config.GetConfig()

	token := r.Header.Get("X-API-Token")
	if token == "" || token != conf.Auth.Token {
		http.Error(w, "", http.StatusUnauthorized)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		slog.With("err", err).Error("Can't read body of request")
		http.Error(w, "Can't ready body", http.StatusInternalServerError)
		return
	}

	var tmpPayload types.CollectPayloadPTR

	err = json.Unmarshal(body, &tmpPayload)
	if err != nil {
		slog.With("err", err).Error("Can't unmarshal body")
		http.Error(w, "Body malformed", http.StatusBadRequest)
		return
	}

	if tmpPayload.Host.Hostname == nil ||
		tmpPayload.Host.CPUs == nil ||
		tmpPayload.Host.RAM == nil ||
		tmpPayload.Host.Uptime == nil ||
		tmpPayload.Load.Date == nil ||
		tmpPayload.Load.One == nil ||
		tmpPayload.Load.Five == nil ||
		tmpPayload.Load.Fifteen == nil ||
		tmpPayload.Load.RamUsed == nil ||
		tmpPayload.Load.ConnectedUsers == nil {
		slog.With("body", body).Error("Body is missing some fields")
		http.Error(w, "Body is missing some fields", http.StatusBadRequest)
		return
	}

	payload := tmpPayload.Deref()

	// Round time to seconds
	payload.Load.Date = payload.Load.Date.Round(time.Second)

	hostID, err := db.GetHostIDByHostname(payload.Host.Hostname)
	if err != nil {
		if !errors.Is(err, db.ErrNotExists) {
			slog.With("err", err).Error("Can't get hostID by hostname from DB")
			http.Error(w, "", http.StatusInternalServerError)
			return
		}

		hostID, err = db.InsertHost(payload.Host)
		if err != nil {
			slog.With("err", err, "hostname", payload.Host.Hostname).Error("Can't insert host in DB")
			http.Error(w, "", http.StatusInternalServerError)
			return
		}
	}

	err = db.InsertLoad(payload.Load, hostID)
	if err != nil {
		slog.With("err", err, "load", payload.Load, "hostID", hostID).Error("Can't insert load in DB")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	slog.With("host", payload.Host.Hostname).Info("Collecting data")

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Collected"))
}

func loadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Allow", "OPTIONS GET")
		return
	} else if r.Method != http.MethodGet {
		http.Error(w, "Only GET is allowed", http.StatusMethodNotAllowed)
		return
	}

	var loads []types.CollectPayload
	var err error

	urlValues := r.URL.Query()
	host := urlValues.Get("host")
	date := urlValues.Get("since")
	if host != "" && date == "" {
		loads, err = db.GetAllLoadsOfHost(host)
	} else if host == "" && date != "" {
		loads, err = db.GetAllLoadsSinceDate(date)
	} else if host != "" && date != "" {
		loads, err = db.GetAllLoadsOfHostSinceDate(host, date)
	} else {
		loads, err = db.GetAllLoads()
	}

	if err != nil {
		slog.With("err", err).Error("Can't get loads")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	if loads == nil {
		loads = make([]types.CollectPayload, 0)
	}

	b, err := json.Marshal(loads)
	if err != nil {
		slog.With("err", err, "loads", loads).Error("Can't marshal loads")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(b)
}

func hostsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Allow", "OPTIONS GET")
		return
	} else if r.Method != http.MethodGet {
		http.Error(w, "Only GET is allowed", http.StatusMethodNotAllowed)
		return
	}

	hosts, err := db.GetAllHosts()
	if err != nil {
		slog.With("err", err).Error("Can't get hosts")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(hosts)
	if err != nil {
		slog.With("err", err, "loads", hosts).Error("Can't marshal hosts")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(b)

}

func singleHostHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Allow", "OPTIONS GET")
		return
	} else if r.Method != http.MethodGet {
		http.Error(w, "Only GET is allowed", http.StatusMethodNotAllowed)
		return
	}

	tmp := strings.TrimPrefix(r.URL.Path, "/api/hosts/")
	id, err := strconv.ParseInt(tmp, 10, 64)
	if err != nil {
		slog.With("err", err).Error("ID not valid")
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	hosts, err := db.GetHostByID(id)
	if err != nil {
		slog.With("err", err, "id", id).Error("Can't get host")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(hosts)
	if err != nil {
		slog.With("err", err, "loads", hosts).Error("Can't marshal hosts")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(b)

}
