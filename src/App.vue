<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'

onLaunch((options) => {
  console.log('App.vue onLaunch', options)
})
onShow((options) => {
  console.log('App.vue onShow', options)
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  // https://github.com/feige996/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({
      url: `/${options.path}`,
      query: options.query,
    })
  }
  else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
:root,
page {
  --bg-dark: #1e1e1e;
  --color-primary: #8a9a5b;
  --color-text-primary: #ffffff;
  --color-text-secondary: #999999;
  --color-danger: #ea5455;
  --color-warning: #ff9f43;
}

page,
body {
  background-color: var(--bg-dark);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  height: 100vh;
}
</style>
