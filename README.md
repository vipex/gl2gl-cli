# Gitlab Migration CLI

Written and tested with `node v12`

To launch the command line, simply run the node application:
```bash
node .
```

## basic usage
Once started the application search for the configuration file, 
if not found will ask the configuration details:

- Source url (es. `https://gitlab.sourceinstance.com`)
- Source access token
- Source registry path needed to migrate containers (es. `registry.sourceinstance.com`)
- Target url (es. `https://gitlab.targetinstance.com`)
- Target access token
- Target registry path needed to migrate containers (es. `registry.targetinstance.com`)

### Generic commands
* `clear` : Clear the console
* `i` | `info` : Shows the current configuration
* `g` | `grp` | `group` : Group related commands ( read `Group sub-ommands` section ) 
* `h` | `help` : Shows this help
* `p` | `prg` | `project` : Project related commands ( read `Project commands` section )
* `log` : Print today's log
* `exit` : Exits the CLI 

### Group sub-commands
* (empty) [%filter] : Shows list of groups (filter should start with %)
* `h` | `help`      : Print this help
* `s` | `show` {id} : Shows specific group's information
* `m` | `migrate` {id} : Try to migrate the specific group
* `mp` | `migrateprj` {id} : Try to migrate all the project in the specific group at once

Options:
* `--force` : force fetch from the server instead of cache
* `--target` : works on target gitlab instead of the source

### Project sub-commands

* (empty) [%filter] : Shows list of projects (filter should start with %)
* `c` | `containers` {id} : Shows specific project's container list (if any)
* `h` | `help`      : Print this help
* `s` | `show` {id} : Shows specific project's information
* `m` | `migrate` {id} : Try to migrate the specific project
* `a` | `archive` {id} : Try to archive the specific project
  
Options:
* `--force` force fetch from the server instead of cache
* `--target` works on target gitlab instead of the source
