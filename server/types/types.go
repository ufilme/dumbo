package types

import "time"

type LoadAvgPTR struct {
	Date    *time.Time
	One     *float64
	Five    *float64
	Fifteen *float64
}

type CollectPayloadPTR struct {
	Hostname *string
	Load     LoadAvgPTR
}

type LoadAvg struct {
	Date    time.Time
	One     float64
	Five    float64
	Fifteen float64
}

type CollectPayload struct {
	Hostname string
	Load     LoadAvg
}

func (p CollectPayloadPTR) Deref() CollectPayload {
	return CollectPayload{
		Hostname: *p.Hostname,
		Load: LoadAvg{
			Date:    *p.Load.Date,
			One:     *p.Load.One,
			Five:    *p.Load.Five,
			Fifteen: *p.Load.Fifteen,
		},
	}
}
