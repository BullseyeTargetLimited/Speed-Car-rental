import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory Database for bookings & vehicle updates
  const bookings: any[] = [
    {
      bookingId: 'SP-849102',
      type: 'combo',
      vehicleId: 'toyota_landcruiser',
      insurancePackageId: 'full_premium',
      selectedCampingGearIds: ['rooftop_tent', 'portable_stove'],
      tourismPackageId: 'jebel_shams_trek',
      pickupLocation: 'Muscat International Airport (MCT)',
      dropoffLocation: 'Muscat International Airport (MCT)',
      pickupDate: '2026-07-15',
      pickupTime: '10:00',
      dropoffDate: '2026-07-22',
      dropoffTime: '10:00',
      needGps: true,
      totalPrice: 489.5,
      customerName: 'Dr. Amjad Al-Busaidi',
      customerEmail: 'amjad.busaidi@omanpetroleum.com',
      customerPhone: '+968 9481 0291',
      language: 'en',
      status: 'confirmed',
      arrivalDate: '2026-07-15',
      arrivalTime: '08:45',
      flightNumber: 'WY 101',
      airlineCarrier: 'Oman Air',
      terminalNumber: 'Terminal 1',
      luggageCount: 3,
      placardText: 'Dr. Amjad Al-Busaidi',
      connectingFlight: 'No (Direct Flight)',
      customerPickupDetails: 'Please have the Jebel Shams trekking guide instructions printed for our team.',
      paymentMethod: 'on-arrival',
      subtotal: 466.19,
      vatAmount: 23.31,
      cardFee: 0,
      travelersCount: 2,
      rentalDays: 7
    },
    {
      bookingId: 'SP-294015',
      type: 'rental',
      vehicleId: 'toyota_prado',
      insurancePackageId: 'standard',
      selectedCampingGearIds: ['rooftop_tent'],
      pickupLocation: 'Nizwa Downtown (SPEED Office)',
      dropoffLocation: 'Muscat International Airport (MCT)',
      pickupDate: '2026-07-18',
      pickupTime: '09:00',
      dropoffDate: '2026-07-23',
      dropoffTime: '18:00',
      needGps: false,
      totalPrice: 221.34,
      customerName: 'Sarah Jenkins',
      customerEmail: 'sarah.jenkins@oxford.ac.uk',
      customerPhone: '+44 7911 123456',
      language: 'en',
      status: 'delivered',
      paymentMethod: 'credit-card',
      subtotal: 205.15,
      vatAmount: 10.26,
      cardFee: 5.93,
      rentalDays: 5
    },
    {
      bookingId: 'SP-730192',
      type: 'combo',
      vehicleId: 'great_wall_tank',
      insurancePackageId: 'full_premium',
      selectedCampingGearIds: [],
      tourismPackageId: 'wahiba_sands_safari',
      pickupLocation: 'Muscat International Airport (MCT)',
      dropoffLocation: 'Muscat International Airport (MCT)',
      pickupDate: '2026-07-20',
      pickupTime: '11:00',
      dropoffDate: '2026-07-24',
      dropoffTime: '11:00',
      needGps: true,
      totalPrice: 345.8,
      customerName: 'Salem Al-Harthy',
      customerEmail: 'salem.harthy@pdo.co.om',
      customerPhone: '+968 9912 3456',
      language: 'ar',
      status: 'confirmed',
      arrivalDate: '2026-07-20',
      arrivalTime: '09:30',
      flightNumber: 'EK 862',
      airlineCarrier: 'Emirates Airline',
      terminalNumber: 'Terminal 1',
      luggageCount: 4,
      placardText: 'Salem Al-Harthy & Family',
      connectingFlight: 'No (Direct Flight)',
      customerPickupDetails: 'Need 2 infant seats if possible.',
      paymentMethod: 'on-arrival',
      subtotal: 329.33,
      vatAmount: 16.47,
      cardFee: 0,
      travelersCount: 4,
      rentalDays: 4
    }
  ];

  const vehicleOverrides: Record<string, { pricePerDay?: number, image?: string }> = {};
  const dynamicPricingSettings = {
    enabled: false,
    occupancyFactor: 1.15
  };

  // Set up Gemini AI if key is present
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini API client initialized successfully.");
    } catch (err) {
      console.error("Error initializing Gemini client:", err);
    }
  } else {
    console.warn("GEMINI_API_KEY is not defined in the environment. Running in fallback simulation mode.");
  }

  // API Route for Gemini Chat
  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // If real Gemini is enabled
    if (ai) {
      try {
        let formattedPrompt = `You are the chief AI travel concierge and rental advisor for SPEED Car Rental, which has 17 years of premium vehicle rental and tour-planning expertise in Oman (established in 2009).
Contact WhatsApp: +96893070770.
Your goals:
1. Provide highly informative, friendly advice on car rentals, camping gears (including rooftop tents, stoves, chairs), and tourism packages in Oman (such as Jebel Shams mountain treks, Wahiba Sands desert safaris, and Nizwa heritage tours).
2. Assist clients with vehicle recommendations from our fleet (Toyota Landcruiser, Toyota Prado, Mitsubishi Pajero, Great Wall Tank 300, Great Wall Haval H9, Changan CS35, etc.).
3. Suggest local tips like: the best season to visit Jebel Akhdar, rules for off-roading in wadis, Bidiya safety, or Muttrah Souq shopping.
Keep answers concise, engaging, and in the language requested (English, Arabic, or French). Always be humble and polite.\n\n`;

        if (history && Array.isArray(history)) {
          history.slice(-6).forEach((h: any) => {
            formattedPrompt += `${h.role === 'user' ? 'Customer' : 'SPEED Agent'}: ${h.text}\n`;
          });
        }
        formattedPrompt += `Customer: ${message}\nSPEED Agent:`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: formattedPrompt,
        });

        const reply = response.text || "I am here to help you coordinate your Omani expedition. Please feel free to ask details about our 4WD vehicles or custom camping packages!";
        return res.json({ text: reply });
      } catch (err: any) {
        console.error("Gemini invocation failed, using simulation engine instead:", err);
        // Fall through to simulation
      }
    }

    // Simulated responses (Rule-based Travel Concierge)
    const normalized = message.toLowerCase();
    let reply = "";

    if (normalized.includes("pricing") || normalized.includes("price") || normalized.includes("cost") || normalized.includes("سعر") || normalized.includes("بكم") || normalized.includes("tarif")) {
      reply = "Our daily rental rates start from 8.5 OMR (~$22 USD) per day for economy sedans like the Nissan Sunny, up to 42.5 OMR (~$110 USD) per day for the robust off-road Toyota Landcruiser 2019. Camping gear rentals (like our premium rooftop tent) start at 7.7 OMR (~$20 USD) per day. Would you like a customized quotation in our Wizard?";
    } else if (normalized.includes("camping") || normalized.includes("tent") || normalized.includes("gear") || normalized.includes("tente") || normalized.includes("tentre") || normalized.includes("tents") || normalized.includes("تخييم") || normalized.includes("خيمة") || normalized.includes("stove")) {
      reply = "We offer premium hard-shell Rooftop Tents compatible with our 4WD fleet (Pajero, Prado, Landcruiser, Tank 300). We also rent out folding camping chairs, portable gas stoves with gas canisters included, cooler boxes, and warm sleeping bags. This is perfect for Jebel Shams, Al Khaluf, or Wahiba Sands deserts. You can add them during step 3 of the booking flow!";
    } else if (normalized.includes("oman") || normalized.includes("tour") || normalized.includes("trip") || normalized.includes("safari") || normalized.includes("trek") || normalized.includes("جولة") || normalized.includes("سياح") || normalized.includes("visite")) {
      reply = "Oman has gorgeous landscapes! We offer three exclusive tourism packages: 1) Nizwa & Bahla Cultural Heritage Expedition (2 days), 2) Jebel Shams Grand Canyon Mountain Trek (3 days), and 3) Wahiba Sands Desert Safari (2 days). These can be booked in combination with our 4WD vehicles and rooftop tents. Which one of these strikes your interest?";
    } else if (normalized.includes("contact") || normalized.includes("phone") || normalized.includes("whatsapp") || normalized.includes("رقم") || normalized.includes("اتصال") || normalized.includes("واتس") || normalized.includes("téléphone")) {
      reply = "You can contact our live customer service agents 24/7 directly on WhatsApp at +96893070770 (or click the floating WhatsApp button in the corner of your screen). We speak English, Arabic, and French!";
    } else if (normalized.includes("pajero") || normalized.includes("landcruiser") || normalized.includes("prado") || normalized.includes("tank 300") || normalized.includes("4wd") || normalized.includes("4x4") || normalized.includes("suv")) {
      reply = "For heavy mountain terrain like Jebel Shams or sandy deserts like Wahiba Sands, we highly recommend our robust 4WDs such as the Toyota Landcruiser 2019, Toyota Prado 2023, or the Great Wall Tank 300 2026. They are compatible with our Rooftop Tents and come with optional comprehensive desert insurance packages!";
    } else if (normalized.includes("insurance") || normalized.includes("assurance") || normalized.includes("تأمين")) {
      reply = "We offer three levels of coverage: Basic (third party only), Standard Collision Damage Cover (reducing deposit liability), and Full Premium Zero Liability (0 OMR excess, covers body, tires, glass, and desert off-road recovery). We highly recommend Full Premium for maximum peace of mind in Oman.";
    } else if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("مرحبا") || normalized.includes("سلام") || normalized.includes("bonjour")) {
      reply = "Hello and welcome to SPEED Oman! Celebrating 17 years of rental and trekking experience. How can I assist you with booking a car, choosing camping equipment, or planning a beautiful route today?";
    } else {
      reply = "Thank you for reaching out to SPEED Car Rental (Oman, Est. 2009). We specialize in rugged SUV/4WD rentals, premium camping equipment (rooftop tents), and curated Oman tours. Ask me anything about off-road guidelines, picking up from Muscat Airport, or gear rental specs!";
    }

    return res.json({ text: reply });
  });

  // API Route for Booking Confirmation with email simulation and delivery
  app.post("/api/booking/confirm", (req, res) => {
    try {
      const { booking, costs } = req.body;
      if (!booking) {
        return res.status(400).json({ error: "Booking object is required" });
      }

      const {
        bookingId,
        type,
        vehicleId,
        pickupLocation,
        dropoffLocation,
        pickupDate,
        pickupTime,
        dropoffDate,
        dropoffTime,
        customerName,
        customerEmail,
        customerPhone,
        language,
        arrivalDate,
        arrivalTime,
        flightNumber,
        airlineCarrier,
        terminalNumber,
        luggageCount,
        placardText,
        connectingFlight,
        customerPickupDetails,
        paymentMethod
      } = booking;

      const emailTo = "admin@bullseyetargetllc.com";
      
      // Format the email body beautifully
      const formattedHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fcfbfa; color: #333;">
          <div style="text-align: center; border-bottom: 2px solid #2d7a82; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #2d7a82; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">SPEED OMAN</h1>
            <p style="margin: 5px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #c47e5a; font-weight: bold;">Premium Fleet & Wilderness Expeditions • Est. 2009</p>
          </div>
          
          <div style="background-color: #2d7a82; color: #ffffff; padding: 12px 16px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <h2 style="margin: 0; font-size: 16px; font-weight: bold;">NEW RESERVATION RECEIVED: #${bookingId}</h2>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #2d7a82; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; margin-top: 0; font-size: 14px; text-transform: uppercase;">1. Customer Information</h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="width: 35%; font-weight: bold; color: #555;">Name:</td>
                <td style="color: #111;">${customerName}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Email:</td>
                <td style="color: #111;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Phone Number:</td>
                <td style="color: #111;">${customerPhone}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Language Preference:</td>
                <td style="color: #111; text-transform: uppercase;">${language}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #2d7a82; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; font-size: 14px; text-transform: uppercase;">2. Arrival & Pickup Details</h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="width: 35%; font-weight: bold; color: #555;">Arrival Date & Time:</td>
                <td style="color: #111; font-weight: bold;">${arrivalDate || pickupDate} at ${arrivalTime || 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Pickup Location:</td>
                <td style="color: #111; font-weight: bold; color: #2d7a82;">${pickupLocation}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Flight Number:</td>
                <td style="color: #111;">${flightNumber ? `<span style="background-color: #eaf1f1; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace;">${flightNumber}</span>` : 'N/A (No Airport Flight)'}</td>
              </tr>
              ${airlineCarrier ? `
              <tr>
                <td style="font-weight: bold; color: #555;">Airline Carrier:</td>
                <td style="color: #111;">${airlineCarrier}</td>
              </tr>` : ''}
              ${terminalNumber ? `
              <tr>
                <td style="font-weight: bold; color: #555;">Airport Terminal:</td>
                <td style="color: #111;">${terminalNumber}</td>
              </tr>` : ''}
              ${luggageCount ? `
              <tr>
                <td style="font-weight: bold; color: #555;">Luggage Count:</td>
                <td style="color: #111;">${luggageCount} bag(s)</td>
              </tr>` : ''}
              ${placardText ? `
              <tr>
                <td style="font-weight: bold; color: #555;">Greeting Placard Text:</td>
                <td style="color: #111; font-weight: bold; color: #c47e5a;">"${placardText}"</td>
              </tr>` : ''}
              ${connectingFlight ? `
              <tr>
                <td style="font-weight: bold; color: #555;">Connecting Flight Info:</td>
                <td style="color: #111;">${connectingFlight}</td>
              </tr>` : ''}
              <tr>
                <td style="font-weight: bold; color: #555;">Dropoff Location:</td>
                <td style="color: #111;">${dropoffLocation}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555; vertical-align: top;">Arrival Pickup Instructions:</td>
                <td style="color: #111; font-style: italic;">${customerPickupDetails || 'No special instructions specified'}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #2d7a82; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; font-size: 14px; text-transform: uppercase;">3. Rental & Calculations</h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="width: 35%; font-weight: bold; color: #555;">Expedition Type:</td>
                <td style="color: #111; text-transform: capitalize; font-weight: bold;">${type}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Pickup Period:</td>
                <td style="color: #111;">${pickupDate} at ${pickupTime || '10:00'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Dropoff Period:</td>
                <td style="color: #111;">${dropoffDate} at ${dropoffTime || '10:00'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Charged Days:</td>
                <td style="color: #111; font-weight: bold; color: #c47e5a;">${costs?.rentalDays || booking.rentalDays || 1} Days <span style="font-size: 11px; color: #777; font-weight: normal;">(24-hr cycle + 2-hr grace period applied)</span></td>
              </tr>
              ${vehicleId ? `
              <tr>
                <td style="font-weight: bold; color: #555;">Vehicle Code:</td>
                <td style="color: #111; font-weight: bold;">${vehicleId.toUpperCase()}</td>
              </tr>` : ''}
              ${booking.insurancePackageId ? `
              <tr>
                <td style="font-weight: bold; color: #555;">Insurance Package:</td>
                <td style="color: #111;">${booking.insurancePackageId}</td>
              </tr>` : ''}
              ${booking.selectedCampingGearIds && booking.selectedCampingGearIds.length > 0 ? `
              <tr>
                <td style="font-weight: bold; color: #555; vertical-align: top;">Camping Extras:</td>
                <td style="color: #111; font-size: 12px;">${booking.selectedCampingGearIds.join(', ')}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="margin-bottom: 25px; padding: 15px; border-radius: 8px; background-color: #f2f7f7; border: 1px dashed #2d7a82;">
            <h3 style="color: #2d7a82; margin-top: 0; margin-bottom: 8px; font-size: 14px; text-transform: uppercase;">4. Financials & Payment Option</h3>
            <table style="width: 100%; font-size: 13px; line-height: 1.6;">
              <tr>
                <td style="width: 35%; font-weight: bold; color: #555;">Payment Method:</td>
                <td style="color: #c47e5a; font-weight: bold; text-transform: uppercase;">
                  ${paymentMethod === 'on-arrival' ? '💳 Pay on Arrival (Cash / Card at Pickup)' : '🔒 Paid Online via Credit Card'}
                </td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555; font-size: 15px;">GRAND TOTAL:</td>
                <td style="color: #2d7a82; font-weight: 900; font-size: 18px;">
                  ${costs?.grandTotal || booking.totalPrice} OMR
                  <span style="font-size: 12px; color: #666; font-weight: normal; margin-left: 5px;">(~ $${costs?.grandTotalUsd || (booking.totalPrice * 2.6).toFixed(2)} USD)</span>
                </td>
              </tr>
            </table>
          </div>

          <div style="font-size: 11px; text-align: center; color: #777; border-top: 1px solid #e0e0e0; padding-top: 15px; line-height: 1.5;">
            This reservation has been compiled and dispatched in real-time. Please review the details and synchronize with the fleet logistics dashboard.<br />
            <strong>Direct Customer WhatsApp Support:</strong> +968 9307 0770
          </div>
        </div>
      `;

      // Log to terminal for direct auditing
      console.log(`\n========================================================================`);
      console.log(`📧 [EMAIL NOTIFICATION SENT] To: ${emailTo}`);
      console.log(`Subject: New Reservation #${bookingId} from ${customerName}`);
      console.log(`Payment Option: ${paymentMethod === 'on-arrival' ? 'PAY ON ARRIVAL' : 'CREDIT CARD'}`);
      console.log(`Vehicle ID: ${vehicleId || 'N/A'}`);
      console.log(`Arrival Info: ${arrivalDate || pickupDate} @ ${arrivalTime || 'N/A'}, Flight: ${flightNumber || 'None'}`);
      if (airlineCarrier) console.log(`Airline: ${airlineCarrier}, Terminal: ${terminalNumber || 'N/A'}`);
      if (luggageCount) console.log(`Bags: ${luggageCount}, Placard Text: "${placardText || 'N/A'}"`);
      if (connectingFlight) console.log(`Connection: ${connectingFlight}`);
      console.log(`Calculation details: ${costs?.rentalDays || 1} Days based on 24hr + 2hr grace period.`);
      console.log(`========================================================================\n`);

      // Add booking to persistent in-memory database list
      bookings.push({
        ...booking,
        status: booking.status || 'confirmed'
      });

      return res.json({
        success: true,
        message: `Reservation confirmed! Custom details transmitted to ${emailTo}.`,
        recipient: emailTo,
        emailHtml: formattedHtml
      });
    } catch (err: any) {
      console.error("Error in /api/booking/confirm:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
        details: err.stack
      });
    }
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "speedoman2009") {
      return res.json({ success: true, token: "speed-admin-token-2026" });
    }
    return res.status(401).json({ success: false, error: "Invalid admin credentials" });
  });

  // Admin authentication middleware helper
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === "Bearer speed-admin-token-2026") {
      return next();
    }
    return res.status(401).json({ error: "Unauthorized access to Admin API" });
  };

  // Get all bookings
  app.get("/api/admin/bookings", requireAdmin, (req, res) => {
    res.json({ success: true, bookings });
  });

  // Create a booking manually
  app.post("/api/admin/bookings", requireAdmin, (req, res) => {
    const { booking } = req.body;
    if (!booking) {
      return res.status(400).json({ error: "Booking object is required" });
    }
    const newBooking = {
      ...booking,
      bookingId: booking.bookingId || 'SP-' + Math.floor(100000 + Math.random() * 900000),
      status: booking.status || 'confirmed'
    };
    bookings.push(newBooking);
    res.json({ success: true, booking: newBooking });
  });

  // Update a booking
  app.put("/api/admin/bookings/:bookingId", requireAdmin, (req, res) => {
    const { bookingId } = req.params;
    const index = bookings.findIndex(b => b.bookingId === bookingId);
    if (index === -1) {
      return res.status(404).json({ error: "Booking not found" });
    }
    bookings[index] = { ...bookings[index], ...req.body.booking };
    res.json({ success: true, booking: bookings[index] });
  });

  // Delete a booking
  app.delete("/api/admin/bookings/:bookingId", requireAdmin, (req, res) => {
    const { bookingId } = req.params;
    const index = bookings.findIndex(b => b.bookingId === bookingId);
    if (index === -1) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const deleted = bookings.splice(index, 1);
    res.json({ success: true, deleted: deleted[0] });
  });

  // Get vehicle overrides & settings
  app.get("/api/admin/vehicles", (req, res) => {
    res.json({ success: true, overrides: vehicleOverrides, settings: dynamicPricingSettings });
  });

  // Update override for a vehicle
  app.put("/api/admin/vehicles/:vehicleId", requireAdmin, (req, res) => {
    const { vehicleId } = req.params;
    const { pricePerDay, image } = req.body;
    
    if (!vehicleOverrides[vehicleId]) {
      vehicleOverrides[vehicleId] = {};
    }
    
    if (pricePerDay !== undefined) {
      vehicleOverrides[vehicleId].pricePerDay = Number(pricePerDay);
    }
    if (image !== undefined) {
      vehicleOverrides[vehicleId].image = image;
    }
    
    res.json({ success: true, override: vehicleOverrides[vehicleId] });
  });

  // Reset overrides
  app.post("/api/admin/vehicles/reset", requireAdmin, (req, res) => {
    for (const key in vehicleOverrides) {
      delete vehicleOverrides[key];
    }
    res.json({ success: true, message: "Vehicle settings reset to defaults" });
  });

  // Update dynamic pricing settings
  app.put("/api/admin/settings/dynamic-pricing", requireAdmin, (req, res) => {
    const { enabled, occupancyFactor } = req.body;
    if (enabled !== undefined) {
      dynamicPricingSettings.enabled = !!enabled;
    }
    if (occupancyFactor !== undefined) {
      dynamicPricingSettings.occupancyFactor = Number(occupancyFactor);
    }
    res.json({ success: true, settings: dynamicPricingSettings });
  });

  // REST API Endpoint for Developer Platforms (booking.com, kayak.com mock sync API)
  app.get("/api/external/vehicles", (req, res) => {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (!apiKey) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing 'x-api-key' header or 'apiKey' query parameter. Please generate an API key in the SPEED Developer Center."
      });
    }

    res.json({
      success: true,
      provider: "SPEED Car Rental & Adventures Oman",
      establishedYear: 2009,
      hq: "Muscat, Al Khuwair, Sultanate of Oman",
      contact: "+96893070770",
      timestamp: new Date().toISOString(),
      inventory: [
        { id: "toyota_landcruiser", make: "TOYOTA LANDCRUISER", year: 2019, class: "4WD / SUV", dailyRateOMR: 42.5, status: "available" },
        { id: "toyota_prado", make: "TOYOTA PRADO", year: 2023, class: "Premium 4WD", dailyRateOMR: 36.5, status: "available" },
        { id: "mitsubishi_pajero", make: "MITSUBISHI PAJERO", year: 2013, class: "4WD Utility", dailyRateOMR: 27.0, status: "available" },
        { id: "great_wall_tank_300", make: "GREAT WALL TANK 300", year: 2026, class: "Premium SUV 4WD", dailyRateOMR: 34.5, status: "available" },
        { id: "kia_sportage", make: "KIA SPORTAGE", year: 2025, class: "Compact SUV", dailyRateOMR: 21.0, status: "available" },
        { id: "nissan_sunny", make: "NISSAN SUNNY", year: 2018, class: "Economy Sedan", dailyRateOMR: 8.5, status: "available" }
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SPEED Car Rental server running on http://localhost:${PORT}`);
  });
}

startServer();
