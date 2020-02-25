// import "./class-component-hooks";

import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);
import AssetManager from "@/assetManager/manager.vue";
import Login from "@/auth/login.vue";
import Logout from "@/auth/logout";
import Dashboard from "@/dashboard/main.vue";
import Settings from "@/settings/settings.vue";
import Game from "@/game/game.vue";
import Invitation from "@/invitation/invitation";

import { coreStore } from "@/core/store";
// import { AssetManager } from "./assetManager/assets";
// const AssetManager = () => import("./assetManager/assets").then(m => m.AssetManager);

export const router = new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
        {
            path: "/",
            redirect: "/dashboard",
        },
        {
            path: "/assets/:folder*",
            component: AssetManager,
            name: "assets",
            meta: {
                auth: true,
            },
        },
        {
            path: "/auth",
            component: { template: "<router-view></router-view>" },
            children: [
                { path: "login", component: Login },
                { path: "logout", component: Logout },
            ],
        },
        {
            path: "/invite/:code",
            component: Invitation,
            meta: {
                auth: true,
            },
        },
        {
            path: "/dashboard",
            component: Dashboard,
            meta: {
                auth: true,
            },
        },
        {
            path: "/settings/:page?",
            name: "settings",
            component: Settings,
            meta: {
                auth: true,
            },
        },
        {
            path: "/game/:creator/:room",
            component: Game,
            meta: {
                auth: true,
            },
        },
    ],
});

router.beforeEach(async (to, _from, next) => {
    coreStore.setLoading(true);
    if (!coreStore.initialized) {
        const response = await fetch("/api/auth");
        if (response.ok) {
            const data = await response.json();
            if (data.auth) {
                coreStore.setAuthenticated(true);
                coreStore.setUsername(data.username);
                coreStore.setEmail(data.email);
                coreStore.setVersion(data.version);
            }
            coreStore.setInitialized(true);
            router.push(to.path);
        } else {
            console.error("Authentication check could not be fulfilled.");
        }
    } else if (to.matched.some(record => record.meta.auth) && !coreStore.authenticated) {
        next({ path: "/auth/login", query: { redirect: to.path } });
    } else {
        const response = await fetch("/api/version");
        if (response.ok) {
            const data = await response.json();
            coreStore.setVersion(data.version);
        }
        next();
    }
});

router.afterEach((_to, _from) => {
    coreStore.setLoading(false);
});
