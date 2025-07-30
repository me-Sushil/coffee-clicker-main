function updateCoffeeView(coffeeQty) {
  let coffeeCounter = document.getElementById("coffee_counter");
  coffeeCounter.innerText = coffeeQty;
}

function clickCoffee(data) {
  data.coffee += 1;
  updateCoffeeView(data.coffee);
  renderProducers(data);
  saveGameData(data);
}

function unlockProducers(producers, coffeeCount) {
  for (let i = 0; i < producers.length; i++) {
    let object = producers[i];
    let price = object.price;
    if (coffeeCount >= price / 2) {
      object.unlocked = true;
    }
  }
}

function getUnlockedProducers(data) {
  return data.producers.filter((element) => element.unlocked === true);
}

function makeDisplayNameFromId(id) {
  return id
    .split("_")
    .map((word) => (word = word[0].toUpperCase() + word.slice(1).toLowerCase()))
    .join(" ");
}

function makeProducerDiv(producer) {
  const containerDiv = document.createElement("div");
  containerDiv.className = "producer";
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" id="buy_${producer.id}">Buy</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild); // Remove each child node
  }
}

function renderProducers(data) {
  let producerContainer = document.getElementById("producer_container");
  deleteAllChildNodes(producerContainer);

  unlockProducers(data.producers, data.coffee);

  data.producers.forEach((producer) => {
    if (producer.unlocked) {
      const div = makeProducerDiv(producer);
      producerContainer.appendChild(div);
    }
  });
}

function getProducerById(data, producerId) {
  return data.producers.find((producer) => producer.id === producerId);
}

function canAffordProducer(data, producerId) {
  let producer = getProducerById(data, producerId);
  if (data.coffee >= producer.price) {
    return true;
  } else {
    return false;
  }
}

function updateCPSView(cps) {
  let cpsIndicator = document.getElementById("cps");
  if (cpsIndicator) {
    cpsIndicator.innerText = cps;
  }
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 1.25);
}

function attemptToBuyProducer(data, producerId) {
  const producer = getProducerById(data, producerId);
  if (!canAffordProducer(data, producerId)) {
    return false;
  }
  data.coffee -= producer.price;
  producer.qty += 1;
  producer.price = updatePrice(producer.price);
  data.totalCPS += producer.cps;
  updateCPSView(data.totalCPS);

  return true;
}

function buyButtonClick(event, data) {
  if (event.target.tagName !== "BUTTON") return;
  let id = event.target.id;
  if (!id.startsWith("buy_")) return;
  let producerId = id.slice(4);
  let success = attemptToBuyProducer(data, producerId);

  if (!success) {
    alert("Not enough coffee!");
    return;
  }
  updateCoffeeView(data.coffee);
  updateCPSView(data.totalCPS);
  renderProducers(data);
  saveGameData(data);
}

function tick(data) {
  data.coffee = data.coffee + data.totalCPS;
  updateCoffeeView(data.coffee);
  saveGameData(data);
}
function saveGameData(data) {
  localStorage.setItem("gameData", JSON.stringify(data));
}

if (typeof process === "undefined") {
  const savedData = localStorage.getItem("gameData");
  const data = savedData ? JSON.parse(savedData) : window.data;

  updateCoffeeView(data.coffee);
  updateCPSView(data.totalCPS);
  renderProducers(data);


  const bigCoffee = document.getElementById("big_coffee");
  bigCoffee.addEventListener("click", () => clickCoffee(data));

  const producerContainer = document.getElementById("producer_container");
  producerContainer.addEventListener("click", (event) => {
    buyButtonClick(event, data);
  });

  setInterval(() => tick(data), 1000);
} else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick,
  };
}
