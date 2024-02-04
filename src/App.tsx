import PixelEditor from "./components/PixelEditor";

function App() {
  return (
    <>
      <PixelEditor
        id="alice"
        onStateChange={() => {}}
        style={{
          width: 100,
          height: 100,
        }}
      />
    </>
  );
}

export default App;
