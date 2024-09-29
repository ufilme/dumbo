package config

import (
	"github.com/pelletier/go-toml/v2"
	"os"
)

type Database struct {
	Path string
}

type Server struct {
	Listen string
}

type Config struct {
	Database Database
	Server   Server
}

var config *Config = nil

func ParseConfig(path string) error {
	configBuff, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	err = toml.Unmarshal(configBuff, &config)
	if err != nil {
		return err
	}

	return nil
}

func GetConfig() *Config {
	return config
}
