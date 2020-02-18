export default function structuring(data, whatNeedData, currentRoom) {
  let newData = {};

  switch (whatNeedData) {
    case 'hiddenPos':
      newData = data.store.hidden.rooms.find(roomFounder => currentRoom === roomFounder.room);
      break;
    case 'controls':
      newData = data.store.controllsRules.rooms[`${currentRoom}`];
      break;
  }
  // newData = data.store.hidden.rooms.find(roomFounder => currentRoom === roomFounder.room);
  return newData;
}