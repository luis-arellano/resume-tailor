const VideoDemo = () => {
    return (
      <section className="max-w-7xl mx-auto px-8 py-12 lg:py-20">
        <div className="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden">
        <iframe
        className="w-full h-full"
         src="https://www.youtube.com/embed/1XficbxXqJ4?si=QxlQiHfO1c9Zf_LG" 
         title="YouTube video player"
         frameborder="1"
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
         referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>
        </div>
      </section>
    );
  };
  
  export default VideoDemo;