router.post("/update-location", async (req, res) => {

  const { partnerId, lat, lng } = req.body;

  io.emit("deliveryLocation", {
    partnerId,
    lat,
    lng
  });

  res.json({ message: "Location updated" });

});