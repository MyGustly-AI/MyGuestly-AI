import PDFDocument from "pdfkit";

// Function to generate a PDF ticket for an event invitation email
export async function generateTicketPDF({guest, event, qrImageBase64,}) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 50,
            });

            const chunks = [];

            doc.on("data", (chunk) => chunks.push(chunk));

            doc.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            doc.fontSize(24)
                .text(event.title, {
                    align: "center",
                });

            doc.moveDown();

            doc.fontSize(14)
                .text(
                    `Guest: ${
                        guest.fullName ||
                        guest.name ||
                        "Guest"
                    }`,
                    {
                        align: "center",
                    }
                );

            doc.moveDown();

            doc.text(
                `Date: ${new Date(
                    event.startDate
                ).toLocaleString()}`
            );

            doc.text(
                `Venue: ${
                    event.location ||
                    event.venueName ||
                    "TBA"
                }`
            );

            doc.text(
                `Event Code: ${event.eventCode}`
            );

            doc.moveDown();

            if (qrImageBase64) {
                const qrBuffer = Buffer.from(
                    qrImageBase64,
                    "base64"
                );

                const imageWidth = 220;

                const x =
                    (doc.page.width - imageWidth) / 2;

                doc.image(qrBuffer, x, doc.y, {
                    width: imageWidth,
                });
            }

            doc.moveDown(3);

            doc.fontSize(10).text(
                "Present this ticket at the entrance.",
                {
                    align: "center",
                }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}