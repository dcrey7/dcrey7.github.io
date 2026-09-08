build-category-props:
    uv run --no-project --with bpy python scripts/build_category_props.py

check-category-props:
    uv run --no-project --with pytest --with playwright pytest -q tests/test_category_props.py

check-interaction:
    google-chrome-stable --headless=new --disable-gpu --virtual-time-budget=25000 --dump-dom http://localhost:8001/tests/interaction.html 2>/tmp/category-interaction.err | grep 'passed'
