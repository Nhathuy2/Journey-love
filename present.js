document.addEventListener("DOMContentLoaded", function () {
  // Hiệu ứng trái tim bay
  function createHearts() {
    const container = document.getElementById("heartsContainer");
    const heartsCount = 30;

    for (let i = 0; i < heartsCount; i++) {
      const heart = document.createElement("div");
      heart.innerHTML = "❤";
      heart.classList.add("heart");
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.top = Math.random() * 100 + "vh";
      const size = Math.random() * 2 + 1;
      heart.style.fontSize = size + "rem";
      const duration = Math.random() * 6 + 4;
      heart.style.animation = `float ${duration}s linear infinite`;
      container.appendChild(heart);
    }
  }

  createHearts();

  // Khởi tạo hành trình
  const startJourneyBtn = document.getElementById("startJourneyBtn");
  const calendarContainer = document.getElementById("calendarContainer");
  const footer = document.getElementById("footer");
  const journeyInfo = document.getElementById("journeyInfo");
  const giftBox = document.getElementById("giftBox");
  const daysContainer = document.getElementById("daysContainer");
  const passwordModal = document.getElementById("passwordModal");
  const passwordInput = document.getElementById("passwordInput");
  const passwordError = document.getElementById("passwordError");
  const passwordSubmit = document.getElementById("passwordSubmit");
  const passwordCancel = document.getElementById("passwordCancel");
  const giftMessageContainer = document.getElementById("giftMessageContainer");
  const giftMessageText = document.getElementById("giftMessageText");
  const dailyGreeting = document.getElementById("dailyGreeting");
  const greetingContainer = document.getElementById("greetingContainer");
  const header = document.getElementById("header");

  let currentDay = 1;
  const totalDays = 12;
  let journeyStarted = false;
  let journeyStartDate = null;
  let previewDay = 0; // Ngày muốn xem trước

  // Mật khẩu xem trước
  const PREVIEW_PASSWORD = "lalala";

  // Ngày bắt đầu cố định: 16/6
  const fixedStartDate = new Date(new Date().getFullYear(), 5, 16);

  // Xác định lời chúc theo buổi trong ngày
  function getTimeGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const greetings = [
      "Chúc em buổi sáng tràn đầy năng lượng và niềm vui! 🌞",
      "Chúc em bữa trưa ngon miệng và thư giãn nhé! 🍲",
      "Buổi chiều làm việc hiệu quả và nhớ nghỉ ngơi em nhé! ☕",
      "Chúc em buổi tối ấm áp, bữa tối ngon miệng và nhớ ngủ sớm nhé! 🌙",
      "Chúc em ngủ ngon và có những giấc mơ đẹp! 💤",
    ];

    if (hours >= 5 && hours < 11) return greetings[0];
    if (hours >= 11 && hours < 14) return greetings[1];
    if (hours >= 14 && hours < 18) return greetings[2];
    if (hours >= 18 && hours < 21) return greetings[3];
    return greetings[4];
  }

  // Hiển thị lời chúc hàng ngày
  function showDailyGreeting() {
    dailyGreeting.textContent = getTimeGreeting();
  }

  // Kiểm tra xem có dữ liệu hành trình trong localStorage không
  function loadJourneyState() {
    const savedState = localStorage.getItem("loveJourney");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        journeyStarted = state.started;
        journeyStartDate = new Date(state.startDate);

        if (journeyStarted) {
          currentDay = calculateCurrentDay();
          updateJourneyInfo();

          journeyInfo.textContent = `Hành trình đã bắt đầu từ ngày ${journeyStartDate.toLocaleDateString(
            "vi-VN"
          )}`;

          // THÊM 2 DÒNG NÀY ĐỂ ẨN GREETING KHI LOAD LẠI TRANG
        }
      } catch (e) {
        console.error("Lỗi khi load trạng thái:", e);
        localStorage.removeItem("loveJourney");
      }
    }
  }

  // Tính toán ngày hiện tại trong hành trình
  function calculateCurrentDay() {
    const today = new Date();
    const startDate = journeyStartDate;

    //Reset giờ để so sánh chính xác ngày
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    // Tính số ngày đã trôi qua
    const timeDiff = today.getTime() - startDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    return Math.max(1, Math.min(totalDays, daysDiff));
  }

  // Lưu trạng thái hành trình vào localStorage
  function saveJourneyState() {
    const state = {
      started: journeyStarted,
      startDate: journeyStartDate,
    };
    localStorage.setItem("loveJourney", JSON.stringify(state));
  }

  // Hiển thị giao diện hành trình
  function showCalendar() {
    // Hiển thị phần hành trình
    calendarContainer.style.display = "block";
    footer.style.display = "block";

    // Kích hoạt hiệu ứng
    setTimeout(() => {
      calendarContainer.classList.add("visible");
      footer.classList.add("visible");
    }, 10);

    createDayCards();
    updateCounters();

    // Mở quà của ngày hiện tại
    openGift(currentDay, false);
  }

  // Cập nhật thông tin hành trình
  function updateJourneyInfo() {
    if (journeyStartDate) {
      const options = { day: "numeric", month: "long", year: "numeric" };
      const startDateStr = journeyStartDate.toLocaleDateString(
        "vi-VN",
        options
      );
      journeyInfo.textContent = `Hành trình bắt đầu ngày ${startDateStr}`;
    }
  }

  // Tạo các thẻ ngày
  function createDayCards() {
    daysContainer.innerHTML = "";

    for (let day = 1; day <= totalDays; day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "day-card";
      dayElement.innerHTML = `
                        <div class="day-number">${day}</div>
                        <div class="day-status">${
                          day < currentDay
                            ? "Đã mở"
                            : day === currentDay
                            ? "Hôm nay"
                            : "Chưa mở"
                        }</div>
                    `;

      if (day <= currentDay) {
        dayElement.classList.add("active");
        dayElement.addEventListener("click", function () {
          openGift(day, false);
        });
      } else {
        dayElement.classList.add("locked");

        const previewButton = document.createElement("button");
        previewButton.textContent = "👁️ Xem trước";
        previewButton.style.marginTop = "8px";
        previewButton.style.padding = "5px 10px";
        previewButton.style.border = "none";
        previewButton.style.borderRadius = "10px";
        previewButton.style.cursor = "pointer";
        previewButton.style.background = "#fff";
        previewButton.style.color = "#8a2be2";
        previewButton.style.fontWeight = "bold";
        previewButton.addEventListener("click", function (e) {
          e.stopPropagation();
          showPasswordModal(day);
        });

        dayElement.appendChild(previewButton);
      }

      daysContainer.appendChild(dayElement);
    }
  }

  // Hiển thị modal nhập mật khẩu
  function showPasswordModal(day) {
    previewDay = day;
    passwordInput.value = "";
    passwordError.style.display = "none";
    passwordModal.classList.add("active");
    passwordInput.focus();
  }

  // Ẩn modal nhập mật khẩu
  function hidePasswordModal() {
    passwordModal.classList.remove("active");
  }

  // Cập nhật bộ đếm
  function updateCounters() {
    document.getElementById("daysPassed").textContent = currentDay - 1;
    document.getElementById("daysLeft").textContent =
      totalDays - (currentDay - 1);
    document.getElementById("giftsOpened").textContent = currentDay - 1;
    document.getElementById(
      "currentDate"
    ).textContent = `Ngày thứ ${currentDay} trong hành trình`;
  }

  // Mở quà
  function openGift(day, isPreview = false) {
    const gift = gifts[day];
    if (gift) {
      const dayNumber = document.querySelector(".gift-front .day-number");
      const giftImageDiv = document.querySelector(".gift-image-fullscreen");

      giftImageDiv.style.opacity = "1";
      giftImageDiv.style.display = "flex";
      giftImageDiv.style.alignItems = "center";
      giftImageDiv.style.justifyContent = "center";

      dayNumber.textContent = day;
      const giftImageTag = document.getElementById("giftImage");

      if (typeof gift.image === "object") {
        giftImageTag.src = gift.image.src;
        giftImageTag.alt = gift.image.alt || "Ảnh quà tặng";
      } else {
        giftImageTag.src = gift.image;
        giftImageTag.alt = "Ảnh quà tặng";
      }

      if (!giftBox.classList.contains("opened")) {
        giftBox.classList.add("opened");
      }

      giftBox.scrollIntoView({ behavior: "smooth", block: "center" });

      // CHỈ HIỂN THỊ TIN NHẮN QUÀ (ĐÃ XÓA LỜI CHÚC THEO BUỔI)
      giftMessageText.textContent = gift.message;
      giftMessageContainer.classList.add("visible");

      if (isPreview) {
        alert(`(Đây là bản xem trước của ngày ${day})`);
      }
    }
  }

  // Dữ liệu quà tặng
  const gifts = {
    1: {
      image: {
        src: "images/dẹp1.png",
        alt: "Xinh đẹp",
      },
      message:
        "Ngày đầu tiên của hành trình rồi nè ! HEHEHEH😁. ",
    },
    2: {
      image: {
        src: "images/dep2.png",
        alt: "Xinh đẹp",
      },
      message:
        "Bắt đầu thấy nhớ a chưaaa.😁.",
    },
    3: {
      image: {
        src: "images/dep3.png",
        alt: "Xinh đẹp",
      },
      message:
        "Cố lên nhéee🥳. ",
    },
    4: {
      image: {
        src: "images/dep4.png",
        alt: "Xinh đẹp",
      },
      message:
        "Nếu cảm thấy nhớ r thì nhắn a ikkkkk😇.",
    },
    5: {
      image: {
        src: "images/dep5.png",
        alt: "Xinh đẹp",
      },
      message:
        "Trụ đến được luôn r hả 🤣. ",
    },
    6: {
      image: {
        src: "images/dep6.png",
        alt: "Xinh đẹp",
      },
      message:
        "Saoo lâu quáaa😵‍💫😵‍💫.",
    },
    7: {
      image: {
        src: "images/dep7.png",
        alt: "Xinh đẹp",
      },
      message:
        "Múnnn nhắnnn e quáaa 😵‍💫.",
    },
    8: {
      image: {
        src: "images/dep12.png",
        alt: "Xinh đẹp",
      },
      message:
        "Heyyy heyyy!! Bịt mặt lạiiii😖.",
    },
    9: {
      image: {
        src: "images/dep9.png",
        alt: "Xinh đẹp",
      },
      message:
        "Ựaaa!!! Lâu quáaa😖.",
    },
    10: {
      image: {
        src: "images/dep10.png",
        alt: "Xinh đẹp",
      },
      message:
        "Mai đến ngày thi rồi ấyy!!! Cố lên nhéeee😇😇... A tin eee💪💪.",
    },
    11: {
      image: {
        src: "images/dep11.png",
        alt: "Xinh đẹp",
      },
      message:
        "Qua được 1 ngày thi r!! E ăn uống nghỉ ngơi đi hennn😘😘.",
    },
  
    12: {
      image: {
        src: "images/dep8.png",
        alt: "Xinh đẹp",
      },
      message:
        "Chúc mừng e đã vượt kì thi tốt đẹp🥳🥳.",
    },  
  };
  // Bắt đầu hành trình
  startJourneyBtn.addEventListener("click", function () {
    // Ktra xem nút có bị disabled không
    if (this.disabled) return;

    journeyStarted = true;
    journeyStartDate = fixedStartDate; // Sử dụng ngày cố định 16/6
    currentDay = calculateCurrentDay();

    showCalendar();
    updateJourneyInfo();
    saveJourneyState();

    //Vô hiệu hóa nút sau khi click
    this.disabled = true;
    this.textContent = "Hành Trình Đã Bắt Đầu";

    //Ẩn lời chúc sau khi nhấn nút
    greetingContainer.style.display = "none";
  });

  // Xử lý click vào hộp quà lớn
  giftBox.addEventListener("click", function () {
    if (journeyStarted && !this.classList.contains("opened")) {
      this.classList.add("opened");
      openGift(currentDay, false);
    }
  });

  // Xử lý mật khẩu
  passwordSubmit.addEventListener("click", function () {
    if (passwordInput.value === PREVIEW_PASSWORD) {
      hidePasswordModal();
      openGift(previewDay, true);
    } else {
      passwordError.style.display = "block";
      passwordInput.focus();
    }
  });

  passwordCancel.addEventListener("click", hidePasswordModal);

  passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      passwordSubmit.click();
    }
  });

  // Hiển thị lời chúc khi tải trang
  showDailyGreeting();

  // Tải trạng thái nếu có
  loadJourneyState();
});
