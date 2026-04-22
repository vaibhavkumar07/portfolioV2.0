import { lazy, Suspense } from "react";
import "./App.css";
import { LoadingProvider } from "./context/LoadingContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

const MainContainer = lazy(() => import("./components/MainContainer"));
const CharacterModel = lazy(() =>
  import("./components/Character").catch(() => ({ default: () => <></> }))
);

function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <Suspense fallback={
          <div style={{ position: "fixed", inset: 0, background: "#080c14", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#ff4f1f", fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 700 }}>VKY</span>
          </div>
        }>
          <MainContainer>
            <ErrorBoundary fallback={null}>
              <Suspense fallback={null}>
                <CharacterModel />
              </Suspense>
            </ErrorBoundary>
          </MainContainer>
        </Suspense>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
