import { AppProvider } from './state/AppContext';
import { ProductionProvider } from './state/ProductionContext';
import { SellingProvider } from './state/SellingContext';
import { Header } from './components/Header/Header';
import { ImportExportBar } from './components/ImportExportBar/ImportExportBar';
import styles from './App.module.css';

function App() {
  return (
    <AppProvider>
      <ProductionProvider>
        <SellingProvider>
          <div className={styles.app}>
            <Header />
            <main className={styles.main}>
              <div className={styles.panel}>生产面板（待实现）</div>
              <div className={styles.panel}>出售面板（待实现）</div>
            </main>
            <ImportExportBar />
          </div>
        </SellingProvider>
      </ProductionProvider>
    </AppProvider>
  );
}

export default App;
