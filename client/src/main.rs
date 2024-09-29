use core::time;
use gethostname::gethostname;
use serde::{Deserialize, Serialize};
use std::{env, fs, path::Path, process};
use sys_info;

const COLLECT_ENDPOINT: &str = "/api/collect";

#[derive(Deserialize)]
struct Server {
    url: String,
    token: String,
}

#[derive(Deserialize)]
struct Collect {
    cycle: u64,
}

#[derive(Deserialize)]
struct Config {
    server: Server,
    collect: Collect,
}

#[derive(Serialize)]
struct Load {
    date: String,
    one: f64,
    five: f64,
    fifteen: f64,
}

#[derive(Serialize)]
struct Payload<'a> {
    hostname: &'a str,
    load: Load,
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Confi path not specified");
        process::exit(1)
    }

    let config_path = Path::new(&args[1]);
    let config = fs::read_to_string(config_path).expect("Config not found");
    let config: Config = toml::from_str(&config).unwrap();

    let hostname = gethostname();
    let hostname = hostname
        .to_str()
        .expect("Could not convert hostname to string");

    let full_url = config.server.url + COLLECT_ENDPOINT;

    loop {
        let l = sys_info::loadavg().unwrap();
        let date = chrono::offset::Utc::now();

        let body = Payload {
            hostname,
            load: Load {
                date: date.to_rfc3339(),
                one: l.one,
                five: l.five,
                fifteen: l.fifteen,
            },
        };

        let body = match serde_json::to_string(&body) {
            Ok(b) => b,
            Err(e) => {
                eprint!("Error seriliazing: {e}");
                std::thread::sleep(time::Duration::from_secs(config.collect.cycle));
                continue;
            }
        };

        let res = minreq::post(&full_url)
            .with_header("X-API-Token", &config.server.token)
            .with_body(body)
            .send();

        match res {
            Ok(res) => {
                if res.status_code < 200 || res.status_code >= 300 {
                    eprint!(
                        "Status code of the request was {}. Body: {}",
                        res.status_code,
                        res.as_str()
                            .expect("Should be able to convert body of response to str")
                    );
                }
            }
            Err(e) => eprint!("Error making http request: {e}"),
        }

        std::thread::sleep(time::Duration::from_secs(config.collect.cycle));
    }
}
