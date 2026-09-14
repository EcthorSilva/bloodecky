import os
import shutil

# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code repo
# and add the `decky-loader/plugin/imports` path to `python.analysis.extraPaths` in `.vscode/settings.json`
import decky
import asyncio

INSTALL_PATH = "/home/deck/Games/bloodborne"
GAME_PKG_PATH = os.path.join(INSTALL_PATH, "game-pkg")
INSTALL_MARKER = os.path.join(INSTALL_PATH, ".bloodecky-installed")

class Plugin:
    async def scan_game_pkg(self) -> dict:
        base_path = os.path.join(GAME_PKG_PATH, "Bloodborne.pkg")
        update_path = os.path.join(GAME_PKG_PATH, "Bloodborne-update-v1.09.pkg")
        return {
            "basePkgFound": os.path.isfile(base_path),
            "basePkgPath": base_path if os.path.isfile(base_path) else None,
            "updatePkgFound": os.path.isfile(update_path),
            "updatePkgPath": update_path if os.path.isfile(update_path) else None,
        }

    async def import_game_pkgs(self, first_path: str, second_path: str) -> dict:
        if not os.path.isfile(first_path) or not os.path.isfile(second_path):
            raise ValueError("Selected game package files do not exist")
        base_path, update_path = self._normalize_pkg_order(first_path, second_path)
        os.makedirs(GAME_PKG_PATH, mode=0o755, exist_ok=True)
        self._move_pkg(base_path, os.path.join(GAME_PKG_PATH, "Bloodborne.pkg"))
        self._move_pkg(update_path, os.path.join(GAME_PKG_PATH, "Bloodborne-update-v1.09.pkg"))
        return await self.scan_game_pkg()

    @staticmethod
    def _normalize_pkg_order(first_path: str, second_path: str) -> tuple[str, str]:
        paths = (first_path, second_path)
        update_candidates = [
            path for path in paths
            if any(keyword in os.path.basename(path).lower() for keyword in ("update", "patch", "dlc"))
        ]
        if len(update_candidates) == 1:
            update_path = update_candidates[0]
            base_path = second_path if update_path == first_path else first_path
            return base_path, update_path

        first_size = os.path.getsize(first_path)
        second_size = os.path.getsize(second_path)
        if first_size == second_size:
            raise ValueError("Could not identify base game and update package")
        if first_size > second_size:
            return first_path, second_path
        return second_path, first_path

    @staticmethod
    def _move_pkg(source_path: str, destination_path: str) -> None:
        if os.path.abspath(source_path) == os.path.abspath(destination_path):
            return
        if os.path.exists(destination_path):
            os.remove(destination_path)
        shutil.move(source_path, destination_path)

    async def validate_installation(self) -> dict:
        return {
            "installed": os.path.isfile(INSTALL_MARKER),
            "installPath": INSTALL_PATH,
        }

    async def apply_mods(self, profile: str, selected_mod_ids: list[str]) -> None:
        # The installer pipeline will apply the selected overlays in this path.
        pass

    # A normal method. It can be called from the TypeScript side using @decky/api.
    async def add(self, left: int, right: int) -> int:
        return left + right

    async def long_running(self):
        await asyncio.sleep(15)
        # Passing through a bunch of random data, just as an example
        await decky.emit("timer_event", "Hello from the backend!", True, 2)

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.loop = asyncio.get_event_loop()
        decky.logger.info("Hello World!")

    # Function called first during the unload process, utilize this to handle your plugin being stopped, but not
    # completely removed
    async def _unload(self):
        decky.logger.info("Goodnight World!")
        pass

    # Function called after `_unload` during uninstall, utilize this to clean up processes and other remnants of your
    # plugin that may remain on the system
    async def _uninstall(self):
        decky.logger.info("Goodbye World!")
        pass

    async def start_timer(self):
        self.loop.create_task(self.long_running())

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        decky.logger.info("Migrating")
        # Here's a migration example for logs:
        # - `~/.config/decky-template/template.log` will be migrated to `decky.decky_LOG_DIR/template.log`
        decky.migrate_logs(os.path.join(decky.DECKY_USER_HOME,
                                               ".config", "decky-template", "template.log"))
        # Here's a migration example for settings:
        # - `~/homebrew/settings/template.json` is migrated to `decky.decky_SETTINGS_DIR/template.json`
        # - `~/.config/decky-template/` all files and directories under this root are migrated to `decky.decky_SETTINGS_DIR/`
        decky.migrate_settings(
            os.path.join(decky.DECKY_HOME, "settings", "template.json"),
            os.path.join(decky.DECKY_USER_HOME, ".config", "decky-template"))
        # Here's a migration example for runtime data:
        # - `~/homebrew/template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        # - `~/.local/share/decky-template/` all files and directories under this root are migrated to `decky.decky_RUNTIME_DIR/`
        decky.migrate_runtime(
            os.path.join(decky.DECKY_HOME, "template"),
            os.path.join(decky.DECKY_USER_HOME, ".local", "share", "decky-template"))
