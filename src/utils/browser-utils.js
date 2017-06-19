// Figure out if the user is using a touch device by whether or not they touch the screen.
let usersDeviceSupportsTouch = false;
window.addEventListener('touchstart', function firstTouchStart() {
  usersDeviceSupportsTouch = true;
  window.removeEventListener('touchstart', firstTouchStart);
});

export function isTouchDevice() {
  return usersDeviceSupportsTouch;
}
