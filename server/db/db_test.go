package db

import (
	"math/rand"
	"testing"
	"time"

	"github.com/samuelemusiani/dumbo/config"
	"github.com/samuelemusiani/dumbo/types"
	"gotest.tools/v3/assert"
)

func setup() error {
	conf := config.Config{
		Database: config.Database{
			Path: ":memory:",
		},
	}
	return Connect(conf.Database.Path)
}

func TestInit(t *testing.T) {
	err := setup()
	assert.NilError(t, err)
}

func TestInsertHost(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	hostname := "foo"

	_, err = InsertHost(hostname)
	assert.NilError(t, err)
}

func TestGetHostIDByHostname(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	hostname := "foo"

	id, err := InsertHost(hostname)
	assert.NilError(t, err)

	id2, err := GetHostIDByHostname(hostname)
	assert.NilError(t, err)
	assert.Equal(t, id, id2)
}

func TestInsertLoad(t *testing.T) {
	err := setup()
	assert.NilError(t, err)

	hostname := "foo"

	id, err := InsertHost(hostname)
	assert.NilError(t, err)

	payload := types.CollectPayload{
		Hostname: hostname,
		Load: types.LoadAvg{
			Date:    time.Now().Round(time.Second),
			One:     rand.Float64(),
			Five:    rand.Float64(),
			Fifteen: rand.Float64(),
		},
	}

	err = InsertLoad(payload.Load, id)
	assert.NilError(t, err)

	loads, err := GetAllLoads()
	assert.NilError(t, err)
	assert.Equal(t, 1, len(loads))

	assert.DeepEqual(t, loads[0], payload)

}
