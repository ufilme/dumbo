package db

import (
	_ "github.com/mattn/go-sqlite3"
	"github.com/samuelemusiani/dumbo/types"

	"database/sql"
	"errors"
)

var global_db *sql.DB

var (
	ErrDuplicate    = errors.New("record already exists")
	ErrNotExists    = errors.New("row not exists")
	ErrUpdateFailed = errors.New("update failed")
	ErrDeleteFailed = errors.New("delete failed")
)

func Connect(url string) error {

	var err error
	global_db, err = sql.Open("sqlite3", url+"?_foreign_keys=on")
	if err != nil {
		return err
	}

	migrate()

	return nil
}

func migrate() error {
	query := `
  CREATE TABLE IF NOT EXISTS hosts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostname TEXT
  );
  CREATE TABLE IF NOT EXISTS load(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time DATETIME,
    one REAL,
    five REAL,
    fifteen REAL,
    hostID INTEGER,
    FOREIGN KEY(hostID) REFERENCES hosts(id)
  );`

	_, err := global_db.Exec(query)
	if err != nil {
		return err
	}

	return nil
}

func InsertHost(hostname string) (int64, error) {
	r, err := global_db.Exec("INSERT INTO hosts(hostname) vaues(?)", hostname)
	if err != nil {
		return 0, err
	}

	id, err := r.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func InsertLoad(l types.LoadAvg, hostID int64) error {
	_, err := global_db.Exec("INSERT INTO load(time, one, five, fifteen, hostID), values(?, ?, ?, ?, ?)", l.Date, l.One, l.Five, l.Fifteen, hostID)
	if err != nil {
		return err
	}

	return nil
}

func GetHostIDByHostname(hostname string) (int64, error) {
	r := global_db.QueryRow("SELECT * FROM hosts WHERE hostname = ?", hostname)

	var id int64
	var hs string
	err := r.Scan(&id, &hs)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, ErrNotExists
		}

		return 0, err
	}

	return id, nil
}
