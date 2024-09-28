use core::time;
use std::io::prelude::*;
use std::{env, fs, path::Path, process};
use sys_info;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("File path not specified");
        process::exit(1)
    }

    let file_path = Path::new(&args[1]);

    let mut file = fs::OpenOptions::new()
        .write(true)
        .append(true)
        .create(true)
        .open(file_path)
        .unwrap();

    loop {
        let l = sys_info::loadavg().unwrap();
        let t = chrono::offset::Local::now();

        if let Err(e) = writeln!(file, "{t:?} {} {} {}", l.one, l.five, l.fifteen) {
            eprintln!("Could not write to file: {}", e)
        };

        std::thread::sleep(time::Duration::from_secs(60));
    }
}
