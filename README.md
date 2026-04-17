# 🚀 Setup Docker Buildx (Advanced)

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/7cbe0967-9bcd-4f4e-86ab-d55c44af9a79" />


Stop wasting CI minutes.  
Make Docker builds **2–5x faster** with built-in caching and production-grade defaults.

![License](https://img.shields.io/github/license/anantacloud-actions/setup-buildx-action)
![Build Speed](https://img.shields.io/badge/builds-2--5x%20faster-brightgreen)
![Caching](https://img.shields.io/badge/cache-GHA%20%7C%20Registry%20%7C%20Local-blueviolet)
![GitHub stars](https://img.shields.io/github/stars/anantacloud-actions/setup-buildx-action?style=social)

---

## ✨ Features

- ✅ GHA Cache (zero-config, fastest for CI)
- 📦 Registry Cache (shared across teams)
- 💾 Local Cache (perfect for self-hosted runners)
- ⚙️ Built-in QEMU (multi-arch out of the box)
- 🔁 Idempotent builder creation (safe for reruns)
- 🌍 Remote builder support (k8s / TCP ready)
- 🧠 Smart defaults (works even with minimal inputs)

---

## 🔥 Why this exists

Most Buildx setups:
- Require multiple actions
- Have fragile caching
- Break on reruns

This action is designed for **real-world pipelines**:
> Faster builds. Fewer failures. More control.

---

## 📦 Basic Usage

```yaml
- name: Setup Buildx
  uses: anantacloud-actions/setup-buildx-action@v1
```

## ⚡ With Multi-Arch Support

```- name: Setup Buildx
  uses: anantacloud-actions/setup-buildx-action@v1
  with:
    platforms: linux/amd64,linux/arm64
```

## 🔁 Caching Strategies

### 🧠 GHA Cache (Recommended)
```- uses: anantacloud-actions/setup-buildx-action@v1
  with:
    cache-type: gha
```

### 📦 Registry Cache (Team Sharing)
```- uses: anantacloud-actions/setup-buildx-action@v1
  with:
    cache-type: registry
    cache-image: myrepo/buildx-cache:latest
```

### 💾 Local Cache (Self-hosted runners)
```- uses: anantacloud-actions/setup-buildx-action@v1
  with:
    cache-type: local
    cache-dir: /tmp/.buildx-cache
```

## 🏗️ Build Example (with cache)
```
- name: Build Image
  run: |
    docker buildx build \
      --cache-from "$BUILDX_CACHE_FROM" \
      --cache-to "$BUILDX_CACHE_TO" \
      --platform linux/amd64,linux/arm64 \
      -t myapp:latest .
```

## 📈 Performance Impact
Typical improvements:

- ⏱ 60–90% faster builds
- 💰 Reduced CI costs
- 🔁 Reliable reruns (no flaky builders)

## 🤝 Contributing
```
git clone https://github.com/anantacloud-actions/setup-buildx-action
cd setup-buildx-action
npm install
npm run build
```
Open a PR 🚀

## 📜 License
MIT

## ⭐ Support
If this saves you time, give it a star ⭐
It helps others discover it.
