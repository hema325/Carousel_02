
const carousel = document.querySelector(".carousel");
const cardsContainer = document.querySelector(".cards");
const cards = document.querySelectorAll(".card");
const leftControl = document.querySelector(".left");
const rightControl = document.querySelector(".right");
const indicatorsContainer = document.querySelector(".indicators");

const indicators = Array.from({ length: cards.length }, () => document.createElement("span"));
let currentIndicatorIdx = 0;

//configurations
const scrollDuration = 3000;
const cardsGap = 20;

const width = element => element.getBoundingClientRect().width;

// handle indicators
indicators.forEach(indicator => indicatorsContainer.append(indicator));

const activeIndicator = index => {
    indicators[index].classList.add("active");

    indicators.forEach((indicator, idx) => {

        if (idx != index)
            indicators[idx].classList.remove("active");

        if (idx >= index - 2 && idx <= index + 2) {
            indicators[idx].style.display = "block";

            if (idx == index - 2 || idx == index + 2)
                indicators[idx].style.transform = "scale(.4)";
            else if (idx != index)
                indicators[idx].style.transform = "scale(.8)";
            else
                indicators[idx].style.transform = "";
        }
        else
            indicators[idx].style.display = "none";

    });
}

activeIndicator(0);

const nextIndicator = () => {

    currentIndicatorIdx = ++currentIndicatorIdx % indicators.length;
    activeIndicator(currentIndicatorIdx);

}

const prevIndicator = () => {

    currentIndicatorIdx = (--currentIndicatorIdx + indicators.length) % indicators.length;
    activeIndicator(currentIndicatorIdx);

}

const scrollUsingIndicator = index => {
    currentIndicatorIdx = index;
    activeIndicator(index);
    cardsContainer.scrollTo({
        left: index * (width(cards[0]) + 20),
        behavior: "smooth"
    });
};

indicators.forEach((indicator, index) => indicator.addEventListener("click", () => scrollUsingIndicator(index)));

// repeat first n element in first slide in last slide for infinite scroll purpose
const cardsPerSlidCount = Math.ceil(cardsContainer.clientWidth / (cards[0].offsetWidth + 20));
[...cards].slice(0, cardsPerSlidCount).forEach(card => cardsContainer.append(card.cloneNode(true)));

// handle scroll controls
const scrollLeft = () => {
    if (cardsContainer.scrollLeft == 0)
        cardsContainer.scrollTo({
            left: cardsContainer.scrollWidth
        });

    prevIndicator();

    cardsContainer.scrollBy({
        left: -(width(cards[0]) + cardsGap),
        behavior: "smooth"
    })
}

const scrollRight = () => {
    //1 here is for handling wrong width result produces of rounding card width
    if (cardsContainer.scrollLeft >= cardsContainer.scrollWidth - cardsContainer.clientWidth - 1)
        cardsContainer.scrollTo({
            left: 0
        });

    nextIndicator();

    cardsContainer.scrollBy({
        left: width(cards[0]) + cardsGap,
        behavior: "smooth"
    });
}

// handle scroll dragging
let isDragging = false;
let pageXStart = 0;
let scrollXStart = 0;

const dragStart = e => {
    isDragging = true;
    pageXStart = e.pageX || e.touches?.[0].pageX;
    scrollXStart = cardsContainer.scrollLeft;
    carousel.classList.add("dragging");
}

const dragging = e => {
    if (isDragging == false)
        return;

    let distance = (e.pageX || e.touches?.[0].pageX) - pageXStart;
    console.log(cardsContainer.scrollRight);
    if (distance > 0 && cardsContainer.scrollLeft == 0) {
        scrollXStart = cardsContainer.scrollWidth - cardsContainer.clientWidth;
        pageXStart = e.pageX || e.touches?.[0].pageX;
    }
    else if (distance < 0 && cardsContainer.scrollLeft > cardsContainer.scrollWidth - cardsContainer.clientWidth - 1) {
        scrollXStart = 0;
        pageXStart = e.pageX || e.touches?.[0].pageX;
    }

    cardsContainer.scrollTo({
        left: scrollXStart + -distance
    });
}

const dragEnd = e => {
    isDragging = false;
    carousel.classList.remove("dragging");
    let cardWidth = width(cards[0]) + cardsGap;
    let scrollLeftCardsCount = Math.round(cardsContainer.scrollLeft / cardWidth); // number of cards that a scroll left width can contain
    let nearestCardScrollLeft = scrollLeftCardsCount * cardWidth;

    cardsContainer.scrollTo({
        left: nearestCardScrollLeft,
        behavior: "smooth"
    });

    activeIndicator(scrollLeftCardsCount);
}

// handle auto scroll

let isScrollPaused = false;

const pauseScrolling = () => isScrollPaused = true;
const continueScrolling = () => isScrollPaused = false;

let autoScrollId = setInterval(() => {
    if (isScrollPaused || isDragging)
        return;

    scrollRight();
}, scrollDuration);

// add carousel events
leftControl.addEventListener("click", scrollLeft);
rightControl.addEventListener("click", scrollRight);
carousel.addEventListener("mousedown", dragStart);
addEventListener("mousemove", dragging);
addEventListener("mouseup", dragEnd);
carousel.addEventListener("touchstart", dragStart);
addEventListener("touchmove", dragging);
addEventListener("touchend", dragEnd);
carousel.addEventListener("mouseenter", pauseScrolling);
carousel.addEventListener("mouseleave", continueScrolling);



