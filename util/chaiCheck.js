export default function (assertionFunction) {
  try {
    assertionFunction();
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
