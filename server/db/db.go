package db

import (
	"fmt"
	"strconv"
	"time"

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
    hostname TEXT,
    cpus INTEGER,
		ram INTEGER,
		uptime INTEGER
  );
  CREATE TABLE IF NOT EXISTS load(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    time INTEGER,
    one REAL,
    five REAL,
    fifteen REAL,
		ramUsed INTEGER,
		connectedUsers INTEGER,
    hostID INTEGER,
    FOREIGN KEY(hostID) REFERENCES hosts(id)
  );`

	_, err := global_db.Exec(query)
	if err != nil {
		return err
	}

	return nil
}

func InsertHost(host types.Host) (int64, error) {
	r, err := global_db.Exec("INSERT INTO hosts(hostname, cpus, ram, uptime) values(?, ?, ?, ?)", host.Hostname, host.CPUs, host.RAM, host.Uptime)
	if err != nil {
		return 0, err
	}

	id, err := r.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func UpdateHost(host types.Host, id int64) error {
	_, err := global_db.Exec("UPDATE hosts SET hostname=?, cpus=?, ram=?, uptime=? WHERE id=?", host.Hostname, host.CPUs, host.RAM, host.Uptime, id)
	if err != nil {
		return err
	}

	return nil
}

func InsertLoad(l types.LoadAvg, hostID int64) error {
	_, err := global_db.Exec(
		"INSERT INTO load(time, one, five, fifteen, ramUsed, connectedUsers, hostID) values(?, ?, ?, ?, ?, ?, ?)",
		l.Date.Unix(), l.One, l.Five, l.Fifteen, l.RamUsed, l.ConnectedUsers, hostID)
	if err != nil {
		return err
	}

	return nil
}

func GetHostIDByHostname(hostname string) (int64, error) {
	r := global_db.QueryRow("SELECT * FROM hosts WHERE hostname = ?", hostname)

	var id int64
	var h types.Host
	err := r.Scan(&id, &h.Hostname, &h.CPUs, &h.RAM, &h.Uptime)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, ErrNotExists
		}

		return 0, err
	}

	return id, nil
}

func getAllLoads(query string, args ...any) ([]types.ReturnLoad, error) {
	rows, err := global_db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var c []types.ReturnLoad
	for rows.Next() {
		var tmp types.ReturnLoad
		var tmp2 int64
		err := rows.Scan(&tmp2, &tmp.Load.One, &tmp.Load.Five, &tmp.Load.Fifteen, &tmp.Load.RamUsed, &tmp.Load.ConnectedUsers, &tmp.HostID)
		tmp.Load.Date = time.Unix(tmp2, 0)

		if err != nil {
			return nil, err
		}

		c = append(c, tmp)
	}

	return c, nil

}

const query = "SELECT load.time, load.one, load.five, load.fifteen, load.ramUsed, load.connectedUsers, hosts.ID FROM load INNER JOIN hosts ON load.hostID=hosts.id "

func GetAllLoads() ([]types.ReturnLoad, error) {
	return getAllLoads(query)
}

func GetAllLoadsOfHost(host string) ([]types.ReturnLoad, error) {
	return getAllLoads(query+"WHERE hosts.hostname=?", host)
}

func GetAllLoadsSinceDate(date string) ([]types.ReturnLoad, error) {
	fmt.Println(date)
	i, err := strconv.ParseInt(date, 10, 64)
	if err != nil {
		return nil, err
	}

	d := time.Unix(i, 0)
	return getAllLoads(query+"WHERE load.time>=?", d.Unix())
}

func GetAllLoadsOfHostSinceDate(host, date string) ([]types.ReturnLoad, error) {

	i, err := strconv.ParseInt(date, 10, 64)
	if err != nil {
		return nil, err
	}

	d := time.Unix(i, 0)
	return getAllLoads(query+"WHERE hosts.hostname=? AND load.time>=?", host, d.Unix())
}

func GetAllHosts() ([]types.Host, error) {
	rows, err := global_db.Query("SELECT * FROM hosts")

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var h []types.Host
	for rows.Next() {
		var tmp types.Host
		err := rows.Scan(&tmp.ID, &tmp.Hostname, &tmp.CPUs, &tmp.RAM, &tmp.Uptime)
		if err != nil {
			return nil, err
		}

		h = append(h, tmp)
	}

	return h, nil
}

func GetHostByID(id int64) (types.Host, error) {
	row := global_db.QueryRow("SELECT * FROM hosts WHERE id = ?", id)

	var h types.Host
	err := row.Scan(&h.ID, &h.Hostname, &h.CPUs, &h.RAM, &h.Uptime)
	if err != nil {
		return types.Host{}, err
	}

	return h, nil
}
