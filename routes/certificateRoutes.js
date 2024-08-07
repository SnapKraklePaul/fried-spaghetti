const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

router.get('/certificate/:courseId', isAuthenticated, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Product.findById(courseId);
    const user = req.user;

    if (!course || !user.completedCourses.includes(courseId)) {
      req.flash('error_msg', 'Certificate not available');
      return res.redirect(`/course/${courseId}`);
    }

    const score = user.quizScores.get(courseId);

    res.render('certificate', {
      pageTitle: 'Course Certificate',
      course: course,
      user: user,
      score: score
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    req.flash('error_msg', 'An error occurred while fetching the certificate');
    res.redirect('/profile');
  }
});

router.get('/download-certificate/:courseId', isAuthenticated, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Product.findById(courseId);
    const user = req.user;

    if (!course || !user.completedCourses.includes(courseId)) {
      req.flash('error_msg', 'Certificate not available');
      return res.redirect(`/course/${courseId}`);
    }

    const score = user.quizScores.get(courseId);
    const pdfBuffer = await generateCertificatePDF(user, course, score);

    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    req.flash('error_msg', 'An error occurred while downloading the certificate');
    res.redirect(`/certificate/${req.params.courseId}`);
  }
});

async function generateCertificatePDF(user, course, score) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 50
    });

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#E63946');

    // Add content to PDF
    doc.font('Helvetica-Bold').fontSize(36).fillColor('#E63946').text('Certificate of Completion', {align: 'center'});
    doc.moveDown(2);

    doc.font('Helvetica').fontSize(18).fillColor('#1D3557').text('This certifies that', {align: 'center'});
    doc.moveDown();

    doc.font('Helvetica-Bold').fontSize(32).fillColor('#E63946').text(`${user.firstName} ${user.lastName}`, {align: 'center'});
    doc.moveDown();

    doc.font('Helvetica').fontSize(18).fillColor('#1D3557').text('has successfully completed the course', {align: 'center'});
    doc.moveDown();

    doc.font('Helvetica-Bold').fontSize(24).fillColor('#1D3557').text(`${course.title}`, {align: 'center'});
    doc.moveDown();

    doc.font('Helvetica').fontSize(18).fillColor('#1D3557').text(`with a score of ${score.toFixed(2)}%`, {align: 'center'});
    doc.moveDown(2);

    doc.fontSize(14).text(`Issued on: ${new Date().toLocaleDateString()}`, {align: 'center'});

    // Add signature line
    const signatureY = doc.y + 50;
    doc.moveTo(doc.page.width / 2 - 100, signatureY)
       .lineTo(doc.page.width / 2 + 100, signatureY)
       .stroke();
    doc.text('Instructor Signature', doc.page.width / 2, signatureY + 5, {align: 'center'});

    doc.end();
  }).catch(error => {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF certificate');
  });
}

module.exports = router;