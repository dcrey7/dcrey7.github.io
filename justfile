build-category-props:
    uv run --no-project --with bpy python scripts/build_category_props.py

check-category-props:
    uv run --no-project --with pytest --with playwright pytest -q tests/test_category_props.py

check-interaction:
    google-chrome-stable --headless=new --disable-gpu --virtual-time-budget=25000 --dump-dom http://localhost:8001/tests/interaction.html 2>/tmp/category-interaction.err | grep 'passed'

check-seo:
    uv run --no-project --with pytest==8.4.2 pytest -q tests/test_seo.py
    uv run --no-project python scripts/seo_audit.py --local

seo-report:
    uv run --no-project python scripts/seo_audit.py

seo-monitor-install:
    install -Dm644 scripts/systemd/hiabhi-seo.service "$HOME/.config/systemd/user/hiabhi-seo.service"
    install -Dm644 scripts/systemd/hiabhi-seo.timer "$HOME/.config/systemd/user/hiabhi-seo.timer"
    systemctl --user daemon-reload
    systemctl --user enable --now hiabhi-seo.timer

seo-monitor-status:
    systemctl --user list-timers hiabhi-seo.timer --no-pager
    systemctl --user show hiabhi-seo.service --property=Result --property=ExecMainStatus
