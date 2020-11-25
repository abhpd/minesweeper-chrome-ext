var isPlaying = true;

setInterval(() => {
    if (isPlaying) {
        const timer_text = document.querySelector(".timer-text");
        console.log(Number(timer_text.innerHTML));
        timer_text.innerHTML = Number(timer_text.innerHTML) + 1;
        if (Number(timer_text.innerHTML) === 10) {
            isPlaying = false;
        }
    }
}, 1000);
