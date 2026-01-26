<template>
  <div class="app">
    <nav class="sidebar">
      <div class="logo">
        <h1>🏨 {{ lang.app.title }}</h1>
      </div>
      <ul class="nav-menu">
        <li>
          <router-link 
            to="/" 
            :class="{ active: $route.path === '/' }"
            class="nav-link"
          >
            {{ lang.nav.dashboard }}
          </router-link>
        </li>
        <li>
          <router-link 
            to="/rooms" 
            :class="{ active: $route.path === '/rooms' }"
            class="nav-link"
          >
            {{ lang.nav.rooms }}
          </router-link>
        </li>
        <li>
          <router-link 
            to="/guests" 
            :class="{ active: $route.path === '/guests' }"
            class="nav-link"
          >
            {{ lang.nav.guests }}
          </router-link>
        </li>
        <li>
          <router-link 
            to="/bookings" 
            :class="{ active: $route.path === '/bookings' }"
            class="nav-link"
          >
            {{ lang.nav.bookings }}
          </router-link>
        </li>
        <li>
          <router-link 
            to="/services" 
            :class="{ active: $route.path === '/services' }"
            class="nav-link"
          >
            {{ lang.nav.services }}
          </router-link>
        </li>
      </ul>
    </nav>

    <div class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { langVN as lang } from './locales/vi'
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
  width: 100%;
  overflow-x: hidden;
}

.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  top: 0;
  left: 0;
  flex-shrink: 0;
  z-index: 100;
}

.logo h1 {
  margin: 0 0 30px 0;
  font-size: 24px;
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 20px;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  margin: 10px 0;
}

.nav-link {
  display: block;
  color: white;
  text-decoration: none;
  padding: 12px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 16px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.3);
  border-left: 4px solid white;
  padding-left: 11px;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100vh;
  box-sizing: border-box;
  margin-left: 250px;
}

.content-wrapper {
  max-width: 100%;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    top: auto;
    left: auto;
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    max-height: none;
  }
}
</style>
