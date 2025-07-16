const Watermark = () => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: 'url(public/Watermark.png)',
      backgroundRepeat: 'repeat',
      backgroundPosition: 'top left', // start from corner
      backgroundSize: '200px',
      opacity: 0.16,
      filter: 'grayscale(1) blur(0.3px)',
      mixBlendMode: 'multiply',
      zIndex: 0,
      pointerEvents: 'none',
    }}
  />
);

export default Watermark;









// const Watermark = () => (
//   <div
//     style={{
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       backgroundImage: 'url(public/Watermark.png)',
//       backgroundRepeat: 'repeat',
//       backgroundPosition: 'center',
//       backgroundSize: '200px',
//       opacity: 0.4, // even lighter to avoid UI clash
//       zIndex: 0,    // push behind all content
//       pointerEvents: 'none',
//     }}
//   />
// );

// export default Watermark;












// const Watermark = () => (
//   <div
//     style={{
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       width: '100%',
//       height: '100%',
//       backgroundImage: 'url(public/Watermark.png)',
//       backgroundRepeat: 'repeat',
//       backgroundSize: '250px',
//       opacity: 0.4,
//       filter: 'grayscale(1) blur(0.3px)',
//       transform: 'rotate(-30deg)',
//       transformOrigin: 'center',
//       zIndex: 1,
//       pointerEvents: 'none',
//     }}
//   />
// );
// export default Watermark;










// const Watermark = () => (
//   <div
//     style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       width: '100vw',
//       height: '100vh',
//       backgroundImage: 'url(src/assets/Watermark.png)',
//       backgroundRepeat: 'no-repeat',
//       backgroundPosition: 'center',
//       backgroundSize: '500px',
//       opacity: 0.9,
//       zIndex: 9999,
//       pointerEvents: 'none',
//     }}
//   />
// );

// export default Watermark;
