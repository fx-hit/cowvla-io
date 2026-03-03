const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach(section => {
  revealObserver.observe(section);
});

const chips = Array.from(document.querySelectorAll("[data-filter]"));
const demoSections = Array.from(document.querySelectorAll("[data-demo-group]"));

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    const filter = chip.dataset.filter;

    chips.forEach(item => item.classList.toggle("is-active", item === chip));
    demoSections.forEach(section => {
      const show = filter === "all" || section.dataset.demoGroup === filter;
      section.classList.toggle("is-hidden", !show);
    });

    updatePlayback();
  });
});

const videos = Array.from(document.querySelectorAll("video"));
const visibleVideos = new Map();
const maxAutoPlay = 4;

function canAutoPlay(video) {
  const section = video.closest("[data-demo-group]");
  return !section || !section.classList.contains("is-hidden");
}

function updatePlayback() {
  const playable = Array.from(visibleVideos.entries())
    .filter(([video]) => canAutoPlay(video))
    .sort((left, right) => right[1] - left[1])
    .slice(0, maxAutoPlay)
    .map(([video]) => video);

  videos.forEach(video => {
    if (playable.includes(video)) {
      if (video.paused) {
        const promise = video.play();
        if (promise && promise.catch) {
          promise.catch(() => {});
        }
      }
      return;
    }

    video.pause();
  });
}

videos.forEach(video => {
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
});

if ("IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          visibleVideos.set(entry.target, entry.intersectionRatio);
        } else {
          visibleVideos.delete(entry.target);
        }
      });

      updatePlayback();
    },
    { threshold: [0.35, 0.6, 0.9] }
  );

  videos.forEach(video => {
    videoObserver.observe(video);
  });
}

videos.forEach(video => {
  video.addEventListener("mouseenter", () => {
    videos.forEach(other => {
      if (other !== video) {
        other.pause();
      }
    });

    const promise = video.play();
    if (promise && promise.catch) {
      promise.catch(() => {});
    }
  });

  video.addEventListener("mouseleave", updatePlayback);
});
