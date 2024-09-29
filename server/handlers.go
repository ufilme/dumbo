package main

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/samuelemusiani/dumbo/config"
	"github.com/samuelemusiani/dumbo/db"
	"github.com/samuelemusiani/dumbo/types"
)

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

	if tmpPayload.Hostname == nil ||
		tmpPayload.Load.Date == nil ||
		tmpPayload.Load.One == nil ||
		tmpPayload.Load.Five == nil ||
		tmpPayload.Load.Fifteen == nil {
		http.Error(w, "Body is missing some fields", http.StatusBadRequest)
		return
	}

	payload := tmpPayload.Deref()

	// Round time to seconds
	payload.Load.Date = payload.Load.Date.Round(time.Second)

	hostID, err := db.GetHostIDByHostname(payload.Hostname)
	if err != nil {
		if !errors.Is(err, db.ErrNotExists) {
			slog.With("err", err).Error("Can't get hostID by hostname from DB")
			http.Error(w, "", http.StatusInternalServerError)
			return
		}

		hostID, err = db.InsertHost(payload.Hostname)
		if err != nil {
			slog.With("err", err, "hostname", payload.Hostname).Error("Can't insert host in DB")
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

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Collected"))
}

func loadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Allow", "OPTIONS POST")
		return
	} else if r.Method != http.MethodGet {
		http.Error(w, "Only GET is allowed", http.StatusMethodNotAllowed)
		return
	}

	loads, err := db.GetAllLoads()
	if err != nil {
		slog.With("err", err).Error("Can't get loads")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	b, err := json.Marshal(loads)
	if err != nil {
		slog.With("err", err, "loads", loads).Error("Can't marshal loads")
		http.Error(w, "", http.StatusInternalServerError)
		return
	}

	w.Write(b)
}
