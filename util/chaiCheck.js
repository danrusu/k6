export default function (assertionFunction) {
  try {
    assertionFunction();
    return true;
  } catch (e) {
    return false;
  }
}
