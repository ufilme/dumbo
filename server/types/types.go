package types

import "time"

type HostPTR struct {
	Hostname *string
	CPUs     *uint
}

type LoadAvgPTR struct {
	Date    *time.Time
	One     *float64
	Five    *float64
	Fifteen *float64
}

type CollectPayloadPTR struct {
	Host HostPTR
	Load LoadAvgPTR
}

type Host struct {
	ID       int64
	Hostname string
	CPUs     uint
}

type LoadAvg struct {
	Date    time.Time
	One     float64
	Five    float64
	Fifteen float64
}

type CollectPayload struct {
	Host Host
	Load LoadAvg
}

func (p CollectPayloadPTR) Deref() CollectPayload {
	return CollectPayload{
		Host: Host{
			Hostname: *p.Host.Hostname,
			CPUs:     *p.Host.CPUs,
		},
		Load: LoadAvg{
			Date:    *p.Load.Date,
			One:     *p.Load.One,
			Five:    *p.Load.Five,
			Fifteen: *p.Load.Fifteen,
		},
	}
}
