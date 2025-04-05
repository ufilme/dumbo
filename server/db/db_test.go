package db

import (
	"math/rand"
	"os"
	"testing"
	"time"

	"github.com/samuelemusiani/dumbo/config"
	"github.com/samuelemusiani/dumbo/types"
	"gotest.tools/v3/assert"
)

func setup() error {
	os.Remove("/tmp/test.db")
	conf := config.Config{
		Database: config.Database{
			Path: "/tmp/test.db",
		},
	}
	return Connect(conf.Database.Path)
}

func randomHost() types.Host {
	return types.Host{
		Hostname: "randomName",
		CPUs:     uint(rand.Intn(16)),
		RAM:      uint64(rand.Intn(64)),
		Uptime:   uint(rand.Intn(100)),
	}
}

func randomLoad() types.LoadAvg {
	return types.LoadAvg{
		Date:           time.Now().Round(time.Second),
		One:            rand.Float64(),
		Five:           rand.Float64(),
		Fifteen:        rand.Float64(),
		RamUsed:        uint64(rand.Intn(64)),
		ConnectedUsers: uint(rand.Intn(64)),
	}
}

func TestInit(t *testing.T) {
	err := setup()
	assert.NilError(t, err)
}

func TestInsertHost(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	host := types.Host{
		Hostname: "foo",
		CPUs:     4,
		RAM:      16,
		Uptime:   100,
	}

	_, err = InsertHost(host)
	assert.NilError(t, err)
}

func TestGetHostIDByHostname(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	host := types.Host{
		Hostname: "perrr",
		CPUs:     16,
		RAM:      64,
		Uptime:   2000,
	}

	id, err := InsertHost(host)
	assert.NilError(t, err)

	id2, err := GetHostIDByHostname(host.Hostname)
	assert.NilError(t, err)
	assert.Equal(t, id, id2)
}

func TestInsertLoad(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	host := types.Host{
		Hostname: "alksdf9",
		CPUs:     1,
		RAM:      3,
		Uptime:   4,
	}

	id, err := InsertHost(host)
	assert.NilError(t, err)

	payload := types.CollectPayload{
		Host: host,
		Load: types.LoadAvg{
			Date:           time.Now().Round(time.Second),
			One:            rand.Float64(),
			Five:           rand.Float64(),
			Fifteen:        rand.Float64(),
			RamUsed:        uint64(rand.Intn(64)),
			ConnectedUsers: uint(rand.Intn(64)),
		},
	}

	err = InsertLoad(payload.Load, id)
	assert.NilError(t, err)

	loads, err := GetAllLoads()
	assert.NilError(t, err)
	assert.Equal(t, 1, len(loads))

	assert.DeepEqual(t, loads[0], payload)
}

func TestGetAllLoads(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	var hosts []types.Host
	var hostsIDs []int64

	for range 4 {
		h := randomHost()
		id, err := InsertHost(h)
		assert.NilError(t, err)

		hosts = append(hosts, h)
		hostsIDs = append(hostsIDs, id)
	}

	var payloads []types.CollectPayload

	for range 10 {
		l := randomLoad()
		hostN := rand.Intn(4)
		p := types.CollectPayload{
			Host: hosts[hostN],
			Load: l,
		}
		err = InsertLoad(p.Load, hostsIDs[hostN])
		assert.NilError(t, err)

		payloads = append(payloads, p)
	}

	loads, err := GetAllLoads()
	assert.NilError(t, err)
	assert.Equal(t, 10, len(loads))

	assert.DeepEqual(t, payloads, loads)
}

func TestGetAllHosts(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	var hosts []types.Host
	var hostsIDs []int64

	for range 4 {
		h := randomHost()
		id, err := InsertHost(h)
		assert.NilError(t, err)
		h.ID = id

		hosts = append(hosts, h)
		hostsIDs = append(hostsIDs, id)
	}

	hosts2, err := GetAllHosts()
	assert.NilError(t, err)
	assert.Equal(t, 4, len(hosts2))

	assert.DeepEqual(t, hosts, hosts2)
}
