const PASSENGER_DB = [];

function validateIdentityDocument(idNumber) {
  if (!idNumber || typeof idNumber !== "string") return false;
  const cleanId = idNumber.trim();
  const cccdRegex = /^\d{12}$/;
  const passportRegex = /^[A-Z]\d{7,8}$/i;
  return cccdRegex.test(cleanId) || passportRegex.test(cleanId);
}

function isSeatOccupied(db, flightNumber, seatNumber) {
  return db.some(
    (p) =>
      p.flightNumber === flightNumber &&
      p.seatNumber === seatNumber &&
      p.isCheckedIn,
  );
}

function findAvailableSeat(db, flightNumber) {
  const rows = 15;
  const cols = ["A", "B", "C", "D", "E", "F"];

  for (let r = 1; r <= rows; r++) {
    for (let c of cols) {
      const seat = `${r}${c}`;
      if (!isSeatOccupied(db, flightNumber, seat)) {
        return seat;
      }
    }
  }
  return null;
}

function registerPassenger(db, newRecord) {
  if (
    !newRecord.pnrCode ||
    !newRecord.passengerName ||
    !newRecord.idNumber ||
    !newRecord.flightNumber
  ) {
    throw new Error("Thông tin hành khách không đầy đủ!");
  }
  if (!validateIdentityDocument(newRecord.idNumber)) {
    throw new Error("Số CCCD (12 chữ số) hoặc Hộ chiếu không hợp lệ!");
  }
  if (db.some((p) => p.pnrCode === newRecord.pnrCode)) {
    throw new Error(`Mã PNR ${newRecord.pnrCode} đã tồn tại trong hệ thống!`);
  }

  const passenger = {
    pnrCode: newRecord.pnrCode.toUpperCase(),
    passengerName: newRecord.passengerName,
    idNumber: newRecord.idNumber.toUpperCase(),
    flightNumber: newRecord.flightNumber.toUpperCase(),
    seatNumber: null,
    isCheckedIn: false,
  };

  db.push(passenger);
  return `Đã tiếp nhận hồ sơ thành công cho PNR: ${passenger.pnrCode}`;
}

function checkInPassenger(db, pnrCode) {
  const passenger = db.find((p) => p.pnrCode === pnrCode.toUpperCase());
  if (!passenger) {
    throw new Error(`Không tìm thấy hồ sơ với mã PNR: ${pnrCode}`);
  }
  if (passenger.isCheckedIn) {
    throw new Error(
      `Hành khách ${passenger.passengerName} đã thực hiện check-in trước đó!`,
    );
  }

  const assignedSeat = findAvailableSeat(db, passenger.flightNumber);
  if (!assignedSeat) {
    throw new Error("Chuyến bay đã hết chỗ ngồi trống!");
  }

  passenger.seatNumber = assignedSeat;
  passenger.isCheckedIn = true;
  return passenger;
}

function printBoardingPass(passenger) {
  console.log("\n==========================================");
  console.log("          BOARDING PASS - SECURITY        ");
  console.log("==========================================");
  console.log(` PNR CODE     : ${passenger.pnrCode}`);
  console.log(` PASSENGER    : ${passenger.passengerName}`);
  console.log(` ID / PASSPORT: ${passenger.idNumber}`);
  console.log(` FLIGHT       : ${passenger.flightNumber}`);
  console.log(` SEAT         : ${passenger.seatNumber}`);
  console.log(` STATUS       : CHECKED-IN & VERIFIED`);
  console.log("==========================================\n");
}

function handleMenuChoice(choice, payload) {
  switch (choice) {
    case "1":
      try {
        const msg = registerPassenger(PASSENGER_DB, payload);
        console.log(msg);
      } catch (err) {
        console.error(`[Lỗi] ${err.message}`);
      }
      break;

    case "2":
      try {
        const passenger = checkInPassenger(PASSENGER_DB, payload.pnrCode);
        console.log(
          `\nCheck-in thành công! Ghế được gán: ${passenger.seatNumber}`,
        );
        printBoardingPass(passenger);
      } catch (err) {
        console.error(`[Lỗi] ${err.message}`);
      }
      break;

    case "3":
      console.log("--- DANH SÁCH HỒ SƠ HÀNH KHÁCH ---");
      if (PASSENGER_DB.length === 0) {
        console.log("Chưa có hồ sơ nào.");
      } else {
        PASSENGER_DB.forEach((p, index) => {
          console.log(
            `${index + 1}. PNR: ${p.pnrCode} | Tên: ${p.passengerName} | Chuyến: ${p.flightNumber} | Ghế: ${p.seatNumber || "Chưa có"} | Check-in: ${p.isCheckedIn}`,
          );
        });
      }
      break;

    case "4":
      console.log("Kết thúc chương trình quản lý hồ sơ.");
      break;

    default:
      console.log("Lựa chọn không hợp lệ! Vui lòng chọn từ 1 đến 4.");
  }
}
