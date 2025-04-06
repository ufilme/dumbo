package types

import "time"

type HostPTR struct {
	Hostname *string
	CPUs     *uint
	RAM      *uint64
	Uptime   *uint
}

type LoadAvgPTR struct {
	Date           *time.Time
	One            *float64
	Five           *float64
	Fifteen        *float64
	RamUsed        *uint64 `json:"ram_used"`
	ConnectedUsers *uint   `json:"connected_users"`
}

type CollectPayloadPTR struct {
	Host HostPTR
	Load LoadAvgPTR
}

type Host struct {
	ID       int64
	Hostname string
	CPUs     uint
	RAM      uint64
	Uptime   uint
}

type LoadAvg struct {
	Date           time.Time
	One            float64
	Five           float64
	Fifteen        float64
	RamUsed        uint64
	ConnectedUsers uint
}

type CollectPayload struct {
	Host Host
	Load LoadAvg
}

type ReturnLoad struct {
	HostID int64
	Load   LoadAvg
}

func (p CollectPayloadPTR) Deref() CollectPayload {
	return CollectPayload{
		Host: Host{
			Hostname: *p.Host.Hostname,
			CPUs:     *p.Host.CPUs,
			RAM:      *p.Host.RAM,
			Uptime:   *p.Host.Uptime,
		},
		Load: LoadAvg{
			Date:           *p.Load.Date,
			One:            *p.Load.One,
			Five:           *p.Load.Five,
			Fifteen:        *p.Load.Fifteen,
			RamUsed:        *p.Load.RamUsed,
			ConnectedUsers: *p.Load.ConnectedUsers,
		},
	}
}
