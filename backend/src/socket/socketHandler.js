let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_table', (tableToken) => {
      if (tableToken) {
        socket.join(`table_${tableToken}`);
        console.log(`[Socket.IO] Client ${socket.id} joined table room: table_${tableToken}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

// Safe event emitters
export const emitMenuUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit('menu:updated', payload);
    console.log('[Socket.IO] Emitted menu:updated');
  }
};

export const emitCategoryUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit('category:updated', payload);
    console.log('[Socket.IO] Emitted category:updated');
  }
};

export const emitAvailabilityUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit('availability:updated', payload);
    console.log('[Socket.IO] Emitted availability:updated');
  }
};

export const emitSpecialsUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit('specials:updated', payload);
    console.log('[Socket.IO] Emitted specials:updated');
  }
};

export const emitSettingsUpdate = (payload) => {
  if (ioInstance) {
    ioInstance.emit('settings:updated', payload);
    console.log('[Socket.IO] Emitted settings:updated');
  }
};

export const emitDishRatingUpdated = (payload) => {
  if (ioInstance) {
    ioInstance.emit('dish:rating_updated', payload);
    console.log('[Socket.IO] Emitted dish:rating_updated');
  }
};
