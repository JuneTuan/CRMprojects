import { useLaunch } from '@tarojs/taro';
import { injectH5Styles } from '@/utils/h5-styles';
import { enableWxDebugIfNeeded } from '@/utils/wx-debug';
import '@/app.css';

function App() {
  useLaunch(() => {
    enableWxDebugIfNeeded();
    injectH5Styles();
  });

  return null;
}

export default App;
