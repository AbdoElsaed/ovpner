const Loader = (): JSX.Element => {
  return (
    <div className="overlay">
      <div id="loader" className="loading-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  )
}

export default Loader
