import { AppProvider } from './state/AppContext';
import { ProductionProvider } from './state/ProductionContext';
import { SellingProvider } from './state/SellingContext';
import { Header } from './components/Header/Header';
import { SkillsFacilitiesPanel } from './components/SkillsFacilitiesPanel/SkillsFacilitiesPanel';
import { ProductionPanel } from './components/ProductionPanel/ProductionPanel';
import { SellingPanel } from './components/SellingPanel/SellingPanel';
import { ImportExportBar } from './components/ImportExportBar/ImportExportBar';
import { Tutorial } from './components/Tutorial/Tutorial';
import styles from './App.module.css';

function App() {
  return (
    <AppProvider>
      <ProductionProvider>
        <SellingProvider>
          <div className={styles.app}>
            <Header />
            <div className={styles.topBar}>
              <SkillsFacilitiesPanel />
            </div>
            <main className={styles.main}>
              <div className={styles.panel}>
                <ProductionPanel />
              </div>
              <div className={styles.panel}>
                <SellingPanel />
              </div>
            </main>
            <ImportExportBar />
            <Tutorial />
          </div>
        </SellingProvider>
      </ProductionProvider>
    </AppProvider>
  );
}

export default App;
